import os
import psycopg2
import csv

PG_HOST = os.environ.get("POSTGRES_HOST", "localhost")
PG_PORT = os.environ.get("POSTGRES_PORT", "5432")
PG_DB = os.environ.get("POSTGRES_DB", "stockshowdown")
PG_USER = os.environ.get("POSTGRES_USER", "postgres")
PG_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "password")

CSV_DIR = "seed_data/csv"
FACTS_CSV = "seed_data/market_facts.csv"

def get_conn():
    return psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD
    )

def drop_and_create_tables(cur, conn):
    # Drop tables (seems to persist after docke rdown)
    cur.execute("""DROP TABLE IF EXISTS "MarketCandles";""")
    cur.execute("""DROP TABLE IF EXISTS "MarketFacts";""")

    # Create tables
    cur.execute("""
        CREATE TABLE "MarketCandles" (
            id SERIAL PRIMARY KEY,
            ticker TEXT NOT NULL,
            date DATE NOT NULL,
            timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            open DOUBLE PRECISION NOT NULL,
            high DOUBLE PRECISION NOT NULL,
            low DOUBLE PRECISION NOT NULL,
            close DOUBLE PRECISION NOT NULL,
            volume DOUBLE PRECISION NOT NULL
        );
    """)
    cur.execute("""
        CREATE TABLE "MarketFacts" (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            title TEXT NOT NULL,
            blurb TEXT NOT NULL
        );
    """)
    conn.commit()
    print("[INFO] Dropped and recreated tables.")

def seed_market_candles(cur, conn):
    files = [f for f in os.listdir(CSV_DIR) if f.endswith(".csv")]
    for file in files:
        filepath = os.path.join(CSV_DIR, file)
        print(f"[LOADING] {file}")
        with open(filepath, 'r') as f:
            next(f)
            cur.copy_expert(
                sql="""COPY "MarketCandles" (ticker, date, timestamp, open, high, low, close, volume) FROM STDIN WITH CSV""",
                file=f
            )
        conn.commit()
        print(f"[DONE] Loaded {file}")

def seed_market_facts(cur, conn):
    print(f"[LOADING] {FACTS_CSV}")
    with open(FACTS_CSV, 'r') as f:
        next(f)
        cur.copy_expert(
            sql="""COPY "MarketFacts" (date, title, blurb) FROM STDIN WITH CSV""",
            file=f
        )
    conn.commit()
    print(f"[DONE] Loaded market_facts.csv")

def main():
    try:
        conn = get_conn()
        cur = conn.cursor()
        drop_and_create_tables(cur, conn)
        seed_market_candles(cur, conn)
        seed_market_facts(cur, conn)
        print("[COMPLETE] Seeding finished.")
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
