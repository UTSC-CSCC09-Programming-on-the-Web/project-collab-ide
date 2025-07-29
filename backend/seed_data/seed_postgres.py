import os
import psycopg2
import csv
import time

PG_HOST = os.environ.get("POSTGRES_HOST", "postgres")
PG_PORT = os.environ.get("POSTGRES_PORT", "5432")
PG_DB = os.environ.get("POSTGRES_DB", "stockshowdown")
PG_USER = os.environ.get("POSTGRES_USER", "postgres")
PG_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "password")

CSV_DIR = "seed_data/csv"
FACTS_CSV = "seed_data/market_facts.csv"

def wait_for_db():
    """Wait for database to be ready"""
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            conn = psycopg2.connect(
                host=PG_HOST,
                port=PG_PORT,
                dbname=PG_DB,
                user=PG_USER,
                password=PG_PASSWORD
            )
            conn.close()
            print("[INFO] Database is ready!")
            return True
        except Exception as e:
            print(f"[INFO] Waiting for database... (attempt {attempt + 1}/{max_attempts})")
            time.sleep(2)
    
    print("[ERROR] Database never became ready")
    return False

def get_conn():
    return psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD
    )

def check_if_data_exists(cur):
    """Check if data already exists to avoid re-seeding"""
    cur.execute('SELECT COUNT(*) FROM "MarketCandles"')
    candles_count = cur.fetchone()[0]
    
    cur.execute('SELECT COUNT(*) FROM "MarketFacts"')
    facts_count = cur.fetchone()[0]
    
    return candles_count > 0 or facts_count > 0

def drop_and_create_tables(cur, conn):
    # Drop tables (seems to persist after docker down)
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
            volume DOUBLE PRECISION NOT NULL,
            market TEXT NOT NULL
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
    if not os.path.exists(CSV_DIR):
        print(f"[WARNING] CSV directory {CSV_DIR} not found, skipping market candles seeding")
        return
        
    files = [f for f in os.listdir(CSV_DIR) if f.endswith(".csv")]
    for file in files:
        filepath = os.path.join(CSV_DIR, file)
        print(f"[LOADING] {file}")
        with open(filepath, 'r') as f:
            next(f)
            cur.copy_expert(
                sql="""COPY "MarketCandles" (ticker, date, timestamp, open, high, low, close, volume, market) FROM STDIN WITH CSV""",
                file=f
            )
        conn.commit()
        print(f"[DONE] Loaded {file}")

def seed_market_facts(cur, conn):
    if not os.path.exists(FACTS_CSV):
        print(f"[WARNING] Facts CSV {FACTS_CSV} not found, skipping market facts seeding")
        return
        
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
    print("[INFO] Starting database seeding process...")
    
    # Wait for database to be ready
    if not wait_for_db():
        print("[ERROR] Database not ready, exiting")
        return
    
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        # Check if data already exists
        if check_if_data_exists(cur):
            print("[INFO] Data already exists, skipping seeding")
            return
        
        drop_and_create_tables(cur, conn)
        seed_market_candles(cur, conn)
        seed_market_facts(cur, conn)
        print("[COMPLETE] Seeding finished.")
    except Exception as e:
        print(f"[ERROR] {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
