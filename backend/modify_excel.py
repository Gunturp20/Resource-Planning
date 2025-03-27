import sys
import openpyxl


sys.stdout.reconfigure(encoding='utf-8')

def modify_excel(file_path, output_path, modem_name):
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active

    for row in ws.iter_rows():
        for cell in row:
            if isinstance(cell.value, str) and "{MODEM}" in cell.value:
                cell.value = cell.value.replace("{MODEM}", modem_name)

    wb.save(output_path)
    print("✅ File berhasil diupdate!")

if __name__ == "__main__":
    file_path = sys.argv[1]  # Argumen 1: Path file input
    output_path = sys.argv[2]  # Argumen 2: Path file output
    modem_name = sys.argv[3]  # Argumen 3: Nama modem yang akan disubstitusi

    modify_excel(file_path, output_path, modem_name)
