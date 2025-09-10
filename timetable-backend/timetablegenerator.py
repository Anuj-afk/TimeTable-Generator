import pandas as pd
import numpy as np
import re
import hashlib
from collections import defaultdict
import sys
import os

# Add this at the beginning to ensure proper output flushing
import sys
sys.stdout.flush()
sys.stderr.flush()

# Handle command line arguments
if len(sys.argv) >= 3:
    INPUT_FILE = sys.argv[1]
    OUTPUT_FILE = sys.argv[2]
    print(f"Using input file: {INPUT_FILE}")
    print(f"Output will be saved to: {OUTPUT_FILE}")
    sys.stdout.flush()  # Force flush after each print
else:
    INPUT_FILE = "Book1.xlsx"
    OUTPUT_FILE = "generated_timetables.xlsx"
    print("Using default file paths")
    sys.stdout.flush()

SHEET_NAME = 0
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
PERIODS_PER_DAY = 8
PERIOD_COLS = [f"P{i+1}" for i in range(PERIODS_PER_DAY)]

# ----------------------------
# HELPERS
# ----------------------------
def normalize_class(name: str) -> str:
    if pd.isna(name):
        return ""
    return str(name).strip().upper().replace(" ", "")

def is_single_section(class_name: str) -> bool:
    # Accept only 1-2 digits + single letter A-F (e.g., 11A, 9C, 10D)
    return bool(re.fullmatch(r"\d{1,2}[A-F]", class_name))

def clean_teacher_name(name) -> str:
    return str(name).strip()

def make_empty_grid():
    return pd.DataFrame("", index=DAYS, columns=PERIOD_COLS)

def balanced_slots(days=DAYS, periods_per_day=PERIODS_PER_DAY):
    # Mon P1, Tue P1, ..., Fri P1, Mon P2, ... (spreads load across days)
    out = []
    for p in range(periods_per_day):
        for d in days:
            out.append((d, f"P{p+1}"))
    return out

def deterministic_offset(key_str: str, modulo: int) -> int:
    # Stable across runs
    h = hashlib.md5(key_str.encode("utf-8")).hexdigest()
    return int(h[:8], 16) % modulo

def rotate(lst, k):
    k = k % len(lst)
    return lst[k:] + lst[:k]

# ----------------------------
# LOAD AND CLEAN DATA
# ----------------------------
try:
    print(f"Reading file: {INPUT_FILE}")
    df = pd.read_excel(INPUT_FILE, sheet_name=SHEET_NAME)

    # Detect/rename the class column to "Class"
    first_col = df.columns[0]
    df = df.rename(columns={first_col: "Class"})

    # Normalize class names
    df["Class"] = df["Class"].apply(normalize_class)

    # Keep only rows with single-section classes
    df = df[df["Class"].apply(is_single_section)].copy()

    # Identify teacher columns
    teacher_cols_raw = [c for c in df.columns if c != "Class"]

    # Normalize teacher column names and ensure uniqueness
    normalized_map = {}
    seen = set()
    for c in teacher_cols_raw:
        new_name = clean_teacher_name(c)
        if new_name in seen:
            # ensure unique
            suffix = 2
            candidate = f"{new_name}_{suffix}"
            while candidate in seen:
                suffix += 1
                candidate = f"{new_name}_{suffix}"
            new_name = candidate
        normalized_map[c] = new_name
        seen.add(new_name)

    df = df.rename(columns=normalized_map)
    teacher_cols = [normalized_map[c] for c in teacher_cols_raw]

    # Coerce all teacher columns to numeric (invalid => NaN)
    for c in teacher_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    # Drop rows that are entirely NaN across teacher columns
    if teacher_cols:
        df = df.dropna(subset=teacher_cols, how="all")

    print("Data loaded and cleaned successfully.")

except Exception as e:
    print(f"Error while loading data: {str(e)}")
    sys.exit(1)

# ----------------------------
# BUILD REQUIREMENTS
# ----------------------------
# teacher_requirements: teacher -> list of (class_name, total_periods)
teacher_requirements = defaultdict(list)

for _, row in df.iterrows():
    class_name = row["Class"]
    for t in teacher_cols:
        periods = row[t]
        if pd.notna(periods) and periods > 0:
            teacher_requirements[t].append((class_name, int(periods)))

# Remove teachers with no assignments
teacher_requirements = {t: v for t, v in teacher_requirements.items() if len(v) > 0}

# ----------------------------
# SCHEDULE STRUCTURES
# ----------------------------
teacher_timetables = {t: make_empty_grid() for t in teacher_requirements.keys()}

# Master class occupancy: class_name -> {(day, period): teacher}
class_occupancy = defaultdict(dict)

# For reporting unscheduled
unscheduled = []  # list of dicts: {teacher, class, required, scheduled}

# ----------------------------
# ASSIGNMENT LOGIC
# ----------------------------
slots = balanced_slots()

# Strategy:
# 1) Sort each teacher's assignments by descending required periods (harder first).
# 2) For each (teacher, class), iterate a rotated view of 'slots' with a deterministic offset.
# 3) Valid slot: teacher free, class free.
# 4) Record any unplaced periods.
for teacher, assignments in teacher_requirements.items():
    assignments = sorted(assignments, key=lambda x: -x[1])
    for class_name, required in assignments:
        scheduled = 0
        offset = deterministic_offset(f"{teacher}|{class_name}", len(slots))
        rotated = rotate(slots, offset)

        for (day, pcol) in rotated:
            if scheduled >= required:
                break
            if teacher_timetables[teacher].loc[day, pcol] != "":
                continue
            if (day, pcol) in class_occupancy[class_name]:
                continue
            # Assign
            teacher_timetables[teacher].loc[day, pcol] = class_name
            class_occupancy[class_name][(day, pcol)] = teacher
            scheduled += 1

        if scheduled < required:
            unscheduled.append({
                "Teacher": teacher,
                "Class": class_name,
                "Required": required,
                "Scheduled": scheduled,
                "Unscheduled": required - scheduled
            })

# ----------------------------
# SUMMARY AND VALIDATION
# ----------------------------
def compute_load(df_grid: pd.DataFrame) -> int:
    return (df_grid.values != "").sum()

teacher_loads = {t: compute_load(grid) for t, grid in teacher_timetables.items()}

notes = []
for t, load in teacher_loads.items():
    if load > len(DAYS) * PERIODS_PER_DAY:
        notes.append(f"Teacher {t} has {load} periods (> {len(DAYS)*PERIODS_PER_DAY}).")

# ----------------------------
# BUILD CLASS TIMETABLES
# ----------------------------
class_timetables = defaultdict(lambda: pd.DataFrame("", index=DAYS, columns=PERIOD_COLS))
for class_name, occupancy in class_occupancy.items():
    for (day, pcol), teacher in occupancy.items():
        class_timetables[class_name].loc[day, pcol] = teacher

# ----------------------------
# EXPORT TO EXCEL
# ----------------------------
try:
    with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
        # Teacher sheets
        for teacher, grid in teacher_timetables.items():
            sheet_name = (teacher or "Teacher")[:31]  # Excel sheet limit
            grid.to_excel(writer, sheet_name=sheet_name)

        # Class sheets
        for class_name, grid in class_timetables.items():
            sheet_name = (class_name or "Class")[:31]
            grid.to_excel(writer, sheet_name=sheet_name)

        # Summary sheet
        summary_rows = []
        for t, load in teacher_loads.items():
            summary_rows.append({"Type": "TeacherLoad", "Teacher": t, "Value": load})
        for row in unscheduled:
            summary_rows.append({
                "Type": "Unscheduled",
                "Teacher": row["Teacher"],
                "Class": row["Class"],
                "Required": row["Required"],
                "Scheduled": row["Scheduled"],
                "Unscheduled": row["Unscheduled"]
            })
        for n in notes:
            summary_rows.append({"Type": "Note", "Message": n})

        if summary_rows:
            pd.DataFrame(summary_rows).to_excel(writer, sheet_name="Summary", index=False)
        else:
            pd.DataFrame([{"Message": "All assignments placed successfully."}]).to_excel(
                writer, sheet_name="Summary", index=False
            )

    print(f"Timetable exported successfully: {OUTPUT_FILE}")

except Exception as e:
    print(f"Error while exporting to Excel: {str(e)}")
    sys.exit(1)

# ----------------------------
# OPTIONAL: CONSOLE PREVIEW
# ----------------------------
for t in sorted(teacher_timetables.keys()):
    print(f"\nTimetable for {t}")
    print(teacher_timetables[t])

for c in sorted(class_timetables.keys()):
    print(f"\nClass timetable for {c}")
    print(class_timetables[c])

# Main execution with proper error handling and completion
def main():
    try:
        print(f"Reading file: {INPUT_FILE}")
        sys.stdout.flush()
        
        # Your existing timetable generation code here...
        # [All your existing logic]
        
        print(f"Writing output to: {OUTPUT_FILE}")
        sys.stdout.flush()
        
        # Your existing Excel writing code...
        # Make sure this section is properly included
        
        # Verify file was created
        if os.path.exists(OUTPUT_FILE):
            file_size = os.path.getsize(OUTPUT_FILE)
            print(f"SUCCESS: Timetable generated successfully - {OUTPUT_FILE} ({file_size} bytes)")
        else:
            print("ERROR: Output file was not created")
            sys.exit(1)
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.stderr.flush()
        sys.exit(1)
    
    finally:
        # Ensure all output is flushed
        sys.stdout.flush()
        sys.stderr.flush()

if __name__ == "__main__":
    main()
    print("SCRIPT_COMPLETED")  # This will help us know the script finished
    sys.stdout.flush()
    sys.exit(0)  # Explicitly exit with success code
