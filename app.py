from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from pymysql.cursors import DictCursor
import pymysql
import datetime
from collections import defaultdict

# Configuration - adjust as needed
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "INTE/mk/3160",
    "database": "club_pos",
    "cursorclass": DictCursor,
    "autocommit": True,
}

API_ORIGIN = "http://localhost:5173"  # update if frontend runs elsewhere

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": API_ORIGIN}})


def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Users
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('manager','staff') NOT NULL
        )
        """
    )

    # Drinks
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS drinks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type ENUM('soft','alcohol') NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            initial_stock INT NOT NULL DEFAULT 0,
            buying_price DECIMAL(10,2) NOT NULL,
            selling_price DECIMAL(10,2) NOT NULL,
            UNIQUE KEY uq_name (name)
        )
        """
    )

    # Orders
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            total DECIMAL(10,2) NOT NULL,
            payment_method ENUM('cash','mpesa') NOT NULL,
            timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Order items
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            drink_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (drink_id) REFERENCES drinks(id)
        )
        """
    )

    # Insert demo users if table empty
    cur.execute("SELECT COUNT(*) AS cnt FROM users")
    if cur.fetchone()["cnt"] == 0:
        cur.executemany(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
            [
                ("manager", generate_password_hash("manager123"), "manager"),
                ("staff", generate_password_hash("staff123"), "staff"),
            ],
        )

    cur.close()
    conn.close()


# -----------------------
# Authentication
# -----------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password_hash, role FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and check_password_hash(user["password_hash"], password):
        return jsonify({"id": user["id"], "username": user["username"], "role": user["role"]})
    return jsonify({"error": "Invalid username or password"}), 401


# -----------------------
# Drinks endpoints
# -----------------------
@app.route("/api/drinks", methods=["GET"])
def get_drinks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, type, stock, initial_stock, buying_price, selling_price FROM drinks ORDER BY name ASC")
    drinks = cur.fetchall()
    # Convert decimals to float
    for d in drinks:
        d["buying_price"] = float(d["buying_price"])
        d["selling_price"] = float(d["selling_price"])
    cur.close()
    conn.close()
    return jsonify(drinks)


@app.route("/api/drinks", methods=["POST"])
def add_drink():
    """
    Add a new drink or increase stock of existing drink by name (case-insensitive).
    If exists: only increment `stock` and do NOT update `initial_stock` or prices.
    If not exists: insert new drink and set initial_stock = stock.
    Expected JSON:
    {
      "name": "Coke",
      "type": "soft",
      "stock": 10,
      "buying_price": 50.0,
      "selling_price": 80.0
    }
    """
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    drink_type = data.get("type")
    stock = data.get("stock")
    buying_price = data.get("buying_price")
    selling_price = data.get("selling_price")

    if (
    not name.strip()               # Ensures name isn't empty or just spaces
    or drink_type not in ("soft", "alcohol")  # Only accept allowed categories
    or stock is None
    or buying_price is None
    or selling_price is None
): return jsonify({"error": "Missing or invalid drink fields"}), 400


    try:
        stock = int(stock)
        buying_price = float(buying_price)
        selling_price = float(selling_price)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check existing by case-insensitive name
    cur.execute("SELECT id, stock FROM drinks WHERE LOWER(name) = LOWER(%s)", (name,))
    existing = cur.fetchone()
    if existing:
        new_stock = existing["stock"] + stock
        cur.execute("UPDATE drinks SET stock = %s WHERE id = %s", (new_stock, existing["id"]))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"Stock updated for existing drink '{name}'", "id": existing["id"]}), 200
    else:
        cur.execute(
            """
            INSERT INTO drinks (name, type, stock, initial_stock, buying_price, selling_price)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (name, drink_type, stock, stock, buying_price, selling_price),
        )
        new_id = cur.lastrowid
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201
    


@app.route("/api/drinks/<int:drink_id>", methods=["PUT"])
def update_drink_stock(drink_id):
    """
    Update stock directly (PUT from manager UI).
    JSON: { "stock": 20 }
    This will update the stock column only.
    """
    data = request.get_json() or {}
    stock = data.get("stock")
    if stock is None:
        return jsonify({"error": "Missing stock value"}), 400
    try:
        stock = int(stock)
        if stock < 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid stock value"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE drinks SET stock = %s WHERE id = %s", (stock, drink_id))
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        return jsonify({"error": "Drink not found"}), 404
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Stock updated"}), 200


@app.route("/api/drinks/<int:drink_id>", methods=["DELETE"])
def delete_drink(drink_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM drinks WHERE id = %s", (drink_id,))
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        return jsonify({"error": "Drink not found"}), 404
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Drink deleted"}), 200


# -----------------------
# Orders endpoints
# -----------------------
def calculate_order_profit(order_id, conn=None):
    """
    Helper to calculate profit for a specific order:
    sum((price - buying_price) * quantity) across order_items for that order.
    Handles NULL buying_price safely.
    """
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    cur = conn.cursor()
    cur.execute("""
        SELECT drink_id, quantity, price, buying_price
        FROM order_items
        WHERE order_id = %s
    """, (order_id,))
    items = cur.fetchall()
    cur.close()

    profit = 0.0
    for it in items:
        price = float(it["price"] or 0)
        buying_price = float(it["buying_price"] or 0)
        quantity = int(it["quantity"] or 0)
        profit += (price - buying_price) * quantity

    if should_close:
        conn.close()

    return round(profit, 2)



@app.route("/api/orders", methods=["POST"])
def create_order():
    """
    Create an order:
    {
      "items": [{ "drinkId": 1, "quantity": 2 }, ...],
      "paymentMethod": "cash"|"mpesa"
    }
    Behavior:
    - Validate stock
    - Calculate total using current selling_price
    - Insert order, insert order_items (store price at time), decrement drink stock
    - Return created order id
    """
    data = request.get_json() or {}
    items = data.get("items")
    payment_method = data.get("paymentMethod")
    if not items or not isinstance(items, list) or payment_method not in ("cash", "mpesa"):
        return jsonify({"error": "Invalid order data"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Validate and prepare prices
    total = 0.0
    drink_updates = []  # tuples (drink_id, new_stock)
    order_items_to_insert = []  # tuples (drink_id, quantity, price)

    try:
        for it in items:
            drink_id = it.get("drinkId")
            quantity = int(it.get("quantity", 0))
            if not drink_id or quantity <= 0:
                raise ValueError("Invalid item in order")

            cur.execute("SELECT stock, selling_price FROM drinks WHERE id = %s", (drink_id,))
            drink = cur.fetchone()
            if not drink:
                raise ValueError(f"Drink id {drink_id} not found")
            if drink["stock"] < quantity:
                raise ValueError(f"Insufficient stock for drink id {drink_id}")

            price = float(drink["selling_price"])
            total += price * quantity
            new_stock = int(drink["stock"]) - quantity
            drink_updates.append((drink_id, new_stock))
            order_items_to_insert.append((drink_id, quantity, price))

        # Create order
        now = datetime.datetime.utcnow()
        cur.execute("INSERT INTO orders (total, payment_method, timestamp) VALUES (%s, %s, %s)", (round(total, 2), payment_method, now))
        order_id = cur.lastrowid

        # Get current buying price
        cur.execute("SELECT buying_price FROM drinks WHERE id = %s", (drink_id,))
        result = cur.fetchone()
        current_buying_price = float(result["buying_price"]) if result and result["buying_price"] is not None else 0.0

        # Insert order_items and update stock
        for (drink_id, quantity, price), (did, new_stock) in zip(order_items_to_insert, drink_updates):
            cur.execute("INSERT INTO order_items (order_id, drink_id, quantity, price, buying_price) VALUES (%s, %s, %s, %s, %s)", (order_id, drink_id, quantity, price, current_buying_price))
            cur.execute("UPDATE drinks SET stock = %s WHERE id = %s", (new_stock, drink_id))

        conn.commit()
    except ValueError as ve:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Server error: " + str(e)}), 500

    cur.close()
    conn.close()
    return jsonify({"message": "Order created", "orderId": order_id}), 201


@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    """
    Delete an order and restore stock quantities for its items.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch order items
    cur.execute("SELECT drink_id, quantity FROM order_items WHERE order_id = %s", (order_id,))
    items = cur.fetchall()
    if not items:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    try:
        # Restore stock for each drink
        for it in items:
            cur.execute("SELECT stock FROM drinks WHERE id = %s", (it["drink_id"],))
            drink = cur.fetchone()
            if drink:
                new_stock = int(drink["stock"]) + int(it["quantity"])
                cur.execute("UPDATE drinks SET stock = %s WHERE id = %s", (new_stock, it["drink_id"]))

        # Delete order (order_items will be cascade-deleted)
        cur.execute("DELETE FROM orders WHERE id = %s", (order_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Server error: " + str(e)}), 500

    cur.close()
    conn.close()
    return jsonify({"message": "Order deleted and stock restored"}), 200


@app.route("/api/orders", methods=["GET"])
def get_orders_grouped():
    """
    Returns grouped orders and per-group totals.
    Accepts query param: ?group=day|week  (default day)
    Response shape matches frontend expectations:
    {
      "groups": { "2023-10-01": [ order, ... ], "2023-10-02": [...] },
      "group_totals": { "2023-10-01": { total_sales, total_profit, count }, ... }
    }
    Each order contains items array with name, quantity, price; total and profit fields added.
    """
    group_mode = request.args.get("group", "day")
    if group_mode not in ("day", "week"):
        group_mode = "day"

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, total, payment_method, timestamp FROM orders ORDER BY timestamp DESC")
    orders = cur.fetchall()

    groups = defaultdict(list)
    group_totals = {}

    for order in orders:
        order_id = order["id"]
        # Fetch items
        cur.execute(
            """
            SELECT oi.drink_id as drink_id, oi.quantity as quantity, oi.price as price, d.name as name
            FROM order_items oi
            JOIN drinks d ON oi.drink_id = d.id
            WHERE oi.order_id = %s
            """,
            (order_id,),
        )
        items = cur.fetchall()
        # Convert decimals
        for it in items:
            it["price"] = float(it["price"])
        order_total = float(order["total"])
        order_timestamp = order["timestamp"]
        # Calculate profit for this order
        order_profit = calculate_order_profit(order_id, conn=conn)

        order_obj = {
            "id": order_id,
            "items": items,
            "total": round(order_total, 2),
            "profit": round(order_profit, 2),
            "payment_method": order["payment_method"],
            "timestamp": order_timestamp.isoformat() if isinstance(order_timestamp, datetime.datetime) else order_timestamp,
        }

        if group_mode == "day":
            key = order_timestamp.date().isoformat()
        else:  # week grouping
            # Year-week as key, e.g., "2023-W40"
            year, week, _ = order_timestamp.isocalendar()
            key = f"{year}-W{week}"

        groups[key].append(order_obj)

    # Compute totals per group
    for key, orders_list in groups.items():
        total_sales = sum(o["total"] for o in orders_list)
        total_profit = sum(o.get("profit", 0) for o in orders_list)
        count = len(orders_list)
        group_totals[key] = {
            "total_sales": round(total_sales, 2),
            "total_profit": round(total_profit, 2),
            "count": count,
        }

    cur.close()
    conn.close()

    return jsonify({"groups": groups, "group_totals": group_totals})


# -----------------------
# Profit endpoint
# -----------------------
@app.route("/api/profit", methods=["GET"])
def get_profit():
    """
    Compute profit per drink and total profit based on order_items.
    Profit =(order_item.price - drinks.buying_price) * order_item.quantity
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name, buying_price, selling_price FROM drinks")
    drinks = cur.fetchall()
    price_map = {d["id"]: (float(d["buying_price"]), float(d["selling_price"]), d["name"]) for d in drinks}

    cur.execute("SELECT drink_id, quantity, price FROM order_items")
    items = cur.fetchall()

    profit_per_drink = {}
    total_profit = 0.0
    for it in items:
        drink_id = it["drink_id"]
        quantity = int(it["quantity"])
        price = float(it["price"])
        buying_price, _, name = price_map.get(drink_id, (0.0, price, "Unknown"))
        profit = (price - buying_price) * quantity
        profit_per_drink[name] = profit_per_drink.get(name, 0.0) + profit
        total_profit += profit

    # Format results
    profit_per_drink = {k: round(v, 2) for k, v in profit_per_drink.items()}
    total_profit = round(total_profit, 2)

    cur.close()
    conn.close()
    return jsonify({"profit_per_drink": profit_per_drink, "total_profit": total_profit})


# -----------------------
# Users password change
# -----------------------
@app.route("/api/users/password", methods=["PUT"])
def change_password():
    data = request.get_json() or {}
    username = data.get("username")
    new_password = data.get("newPassword")
    if not username or not new_password:
        return jsonify({"error": "Missing username or new password"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    hashed = generate_password_hash(new_password)
    cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed, user["id"]))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Password updated"}), 200


@app.route("/", methods=["GET"])
def home():
    return "Club POS System API running"


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)