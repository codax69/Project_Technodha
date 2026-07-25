import random
import string
import datetime
import apps.orders.models
from django.db import migrations, models

def safe_database_setup(apps, schema_editor):
    cursor = schema_editor.connection.cursor()
    cursor.execute("DROP INDEX IF EXISTS orders_order_order_number_4e985f70_like;")
    cursor.execute("DROP INDEX IF EXISTS orders_order_order_number_key;")
    cursor.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='orders_order' AND column_name='order_number'
            ) THEN
                ALTER TABLE orders_order ADD COLUMN order_number VARCHAR(32);
            END IF;
        END $$;
    """)
    cursor.execute("SELECT id FROM orders_order WHERE order_number IS NULL OR order_number = '';")
    rows = cursor.fetchall()
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    for (order_id,) in rows:
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = f"TH-ORD-{date_str}-{order_id}-{random_str}"
        cursor.execute("UPDATE orders_order SET order_number = %s WHERE id = %s;", [code, order_id])

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_alter_order_status'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='order',
                    name='order_number',
                    field=models.CharField(
                        db_index=True,
                        default=apps.orders.models.generate_unique_order_number,
                        help_text='Unique readable order reference ID',
                        max_length=32,
                        unique=True
                    ),
                ),
            ],
            database_operations=[
                migrations.RunPython(safe_database_setup, reverse_code=migrations.RunPython.noop),
                migrations.RunSQL(
                    sql="CREATE UNIQUE INDEX IF NOT EXISTS orders_order_order_number_key ON orders_order(order_number);",
                    reverse_sql="DROP INDEX IF EXISTS orders_order_order_number_key;"
                )
            ]
        ),
    ]
