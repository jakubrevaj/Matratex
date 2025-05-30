import pandas as pd
from dbfread import DBF

def convert_dbf_to_csv(dbf_file_path, csv_file_path):
    try:
        print("Načítavam DBF súbor s kódovaním DOS/OS2-852...")
        
        # Použitie správneho kódovania 'cp852' (čo zodpovedá DOS/OS2-852)
        table = DBF(dbf_file_path, load=True, encoding='cp852')
        df = pd.DataFrame(iter(table))

        # Uloženie do CSV súboru s UTF-8 kódovaním
        df.to_csv(csv_file_path, index=False, encoding='utf-8')

        print(f"Konverzia úspešne dokončená! Súbor uložený ako: {csv_file_path}")
    except Exception as e:
        print(f"Chyba pri konverzii: {e}")

# Cesty k súborom
dbf_file_path = "/Users/jakubrevaj/Downloads/ODB.DBF"  # Nahraď vlastnou cestou k DBF súboru
csv_file_path = "/Users/jakubrevaj/Downloads/ODB_converted.csv"

convert_dbf_to_csv(dbf_file_path, csv_file_path)
