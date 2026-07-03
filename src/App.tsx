"use client";

import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver"; // npm install file-saver

// Types
type UserRole = "manager" | "staff";
type DrinkType = "soft" | "alcohol";
type PaymentMethod = "cash" | "mpesa";

interface Drink {
  id: number;
  name: string;
  type: DrinkType;
  stock: number;
  initial_stock: number;
  buying_price: number;
  selling_price: number;
}

interface OrderItem {
  drink_id: number;
  drinkId?: number;
  quantity: number;
  price: number;
  name: string;
  buying_price?: number;
  item_profit?: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  profit?: number;
  payment_method: PaymentMethod;
  timestamp: string | Date;
}

interface GroupTotals {
  total_sales: number;
  total_profit: number;
  count: number;
}

interface GroupedData {
  groups: Record<string, Order[]>;
  group_totals: Record<string, GroupTotals>;
}

interface User {
  id: number;
  username: string;
  role: UserRole;
}

// API base URL
const API_BASE = " http://127.0.0.1:5000/api";

// Styles (same as previous)
const styles = {
  button: {
    background: "linear-gradient(to right, #4f46e5, #8b5cf6)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  } as React.CSSProperties,
  buttonHover: {
    background: "linear-gradient(to right, #4338ca, #7c3aed)",
  } as React.CSSProperties,
  buttonOutline: {
    background: "transparent",
    border: "1.5px solid white",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    marginTop: "0.25rem",
    fontSize: "1rem",
    boxSizing: "border-box",
  } as React.CSSProperties,
  label: {
    fontWeight: 500,
    color: "#374151",
  } as React.CSSProperties,
  card: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    padding: "1.5rem",
  } as React.CSSProperties,
  cardHeader: {
    marginBottom: "1rem",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#4f46e5",
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    marginTop: "0.25rem",
    fontSize: "1rem",
    backgroundColor: "white",
    boxSizing: "border-box",
  } as React.CSSProperties,
  radioGroupItem: {
    marginRight: "0.5rem",
    cursor: "pointer",
  } as React.CSSProperties,
  errorText: {
    color: "#dc2626",
    fontSize: "0.875rem",
    textAlign: "center",
  } as React.CSSProperties,
  badgeSoft: {
    backgroundColor: "#bfdbfe",
    color: "#1e40af",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    display: "inline-block",
  } as React.CSSProperties,
  badgeAlcohol: {
    backgroundColor: "#fecaca",
    color: "#991b1b",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    display: "inline-block",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse",
  } as React.CSSProperties,
  th: {
    textAlign: "left",
    padding: "0.5rem 1rem",
    borderBottom: "2px solid #e0e7ff",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
  } as React.CSSProperties,
  td: {
    padding: "0.5rem 1rem",
    borderBottom: "1px solid #e0e7ff",
  } as React.CSSProperties,
  textCenter: {
    textAlign: "center",
  } as React.CSSProperties,
  textGray: {
    color: "#6b7280",
  } as React.CSSProperties,
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as React.CSSProperties,
  flexCol: {
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  scrollY: {
    maxHeight: "24rem",
    overflowY: "auto",
    paddingRight: "0.5rem",
  } as React.CSSProperties,
  footer: {
    background: "linear-gradient(to right, #4f46e5, #8b5cf6)",
    color: "white",
    padding: "1.5rem 0",
    textAlign: "center",
    marginTop: "3rem",
  } as React.CSSProperties,
  header: {
    background: "linear-gradient(to right, #4338ca, #7c3aed)",
    color: "white",
    padding: "1rem 0",
    boxShadow: "0 2px 4px rgb(0 0 0 / 0.1)",
  } as React.CSSProperties,
  headerContainer: {
    maxWidth: "1024px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  headerLogo: {
    backgroundColor: "white",
    color: "#4338ca",
    borderRadius: "9999px",
    width: "2rem",
    height: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "0.5rem",
    fontWeight: "700",
  } as React.CSSProperties,
  welcomeText: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
  badgeRole: {
    backgroundColor: "#4338ca",
    borderRadius: "9999px",
    padding: "0.125rem 0.5rem",
    fontSize: "0.75rem",
    color: "white",
    textTransform: "capitalize",
  } as React.CSSProperties,
  container: {
    maxWidth: "1024px",
    margin: "0 auto",
    padding: "2rem 1rem",
  } as React.CSSProperties,
  grid1: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "2rem",
  } as React.CSSProperties,
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  } as React.CSSProperties,
  grid2Responsive: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  } as React.CSSProperties,
  textSuccess: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    marginTop: "1rem",
    fontWeight: "500",
    textAlign: "center",
  } as React.CSSProperties,
  cursorPointer: {
    cursor: "pointer",
  } as React.CSSProperties,
  disabledBtn: {
    opacity: 0.6,
    cursor: "not-allowed",
  } as React.CSSProperties,
  smallButton: {
    border: "1.5px solid #4338ca",
    color: "#4338ca",
    padding: "0.25rem 0.75rem",
    borderRadius: "0.375rem",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "background-color 0.3s",
  } as React.CSSProperties,
  smallButtonHover: {
    backgroundColor: "#eef2ff",
  } as React.CSSProperties,
  lowStockText: {
    color: "#dc2626",
    marginLeft: "0.25rem",
  } as React.CSSProperties,
};

function ButtonWithHover({
  onClick,
  children,
  disabled,
  style,
  outline = false,
  small = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  outline?: boolean;
  small?: boolean;
}) {
  const [hover, setHover] = useState(false);

  const baseStyle = outline
    ? styles.buttonOutline
    : small
    ? styles.smallButton
    : styles.button;
  const hoverStyle = outline
    ? { backgroundColor: "#4338ca" }
    : small
    ? styles.smallButtonHover
    : styles.buttonHover;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...(hover ? hoverStyle : {}),
        ...(disabled ? styles.disabledBtn : {}),
        ...style,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      type="button"
    >
      {children}
    </button>
  );
}

function InputInline({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  style,
  min,
}: {
  id?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  min?: number;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      style={{ ...styles.input, ...style }}
    />
  );
}

function LabelInline({
  htmlFor,
  children,
  style,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label htmlFor={htmlFor} style={{ ...styles.label, ...style }}>
      {children}
    </label>
  );
}

function CardInline({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <div style={{ ...styles.card, ...style }}>{children}</div>;
}

function CardHeaderInline({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <div style={{ ...styles.cardHeader, ...style }}>{children}</div>;
}

function CardTitleInline({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <h2 style={{ ...styles.cardTitle, ...style }}>{children}</h2>;
}

export default function ClubPOSSystem() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Manager and staff state
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [groupMode, setGroupMode] = useState<"day" | "week">("day");
  const [groupedData, setGroupedData] = useState<GroupedData>({
    groups: {},
    group_totals: {},
  });

  const [newDrink, setNewDrink] = useState<Omit<Drink, "id" | "initial_stock">>({
    name: "",
    type: "soft",
    stock: 0,
    buying_price: 0,
    selling_price: 0,
  });

  useEffect(() => {
    if (currentUser) {
      fetchDrinks();
      fetchGroupedOrders(groupMode);
    } else {
      setDrinks([]);
      setGroupedData({ groups: {}, group_totals: {} });
      setOrderItems([]);
      setPaymentMethod("cash");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchGroupedOrders(groupMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMode]);

  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newManagerPassword, setNewManagerPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  // Staff order state
  const [orderItems, setOrderItems] = useState<
    { drinkId: number; quantity: number; price: number }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // Fetch drinks from backend
  const fetchDrinks = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/drinks`);
      if (!res.ok) throw new Error("Failed to fetch drinks");
      const data: Drink[] = await res.json();
      setDrinks(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch grouped orders (day or week)
  const fetchGroupedOrders = async (mode: "day" | "week" = "day"): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/orders?group=${mode}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: GroupedData = await res.json();
      const groupsCopy: Record<string, Order[]> = {};
      Object.keys(data.groups || {}).forEach((k) => {
        groupsCopy[k] = (data.groups[k] || []).map((order) => ({
          ...order,
          timestamp: new Date(order.timestamp),
        }));
      });
      setGroupedData({
        groups: groupsCopy,
        group_totals: data.group_totals || {},
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Login handler
  const handleLogin = async (): Promise<void> => {
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        setLoginError(errorData.error || "Login failed");
        return;
      }
      const userData: User = await res.json();
      setCurrentUser(userData);
      setLoginUsername("");
      setLoginPassword("");
      setLoginError("");
    } catch (err) {
      setLoginError("Login failed: " + String(err));
    }
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setLoginUsername("");
    setLoginPassword("");
    setDrinks([]);
    setGroupedData({ groups: {}, group_totals: {} });
    setOrderItems([]);
    setPaymentMethod("cash");
  };

  // Manager: Add a new drink
  const handleAddDrink = async (): Promise<void> => {
    if (
      !newDrink.name ||
      newDrink.stock < 0 ||
      newDrink.buying_price < 0 ||
      newDrink.selling_price < 0
    ) {
      alert("Please fill all fields with valid values");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/drinks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDrink.name,
          type: newDrink.type,
          stock: newDrink.stock,
          initial_stock: newDrink.stock,
          buying_price: newDrink.buying_price,
          selling_price: newDrink.selling_price,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to add drink");
        return;
      }
      await fetchDrinks();
      setNewDrink({
        name: "",
        type: "soft",
        stock: 0,
        buying_price: 0,
        selling_price: 0,
      });
    } catch (err) {
      alert("Failed to add drink: " + String(err));
    }
  };

  // Manager: Update stock for a drink
  const handleUpdateStock = async (id: number, newStock: number): Promise<void> => {
    if (newStock < 0) return;
    try {
      const res = await fetch(`${API_BASE}/drinks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update stock");
        return;
      }
      await fetchDrinks();
    } catch (err) {
      alert("Failed to update stock: " + String(err));
    }
  };

  // Manager: Delete drink
  const handleDeleteDrink = async (id: number): Promise<void> => {
    if (!confirm("Are you sure you want to delete this drink?")) return;
    try {
      const res = await fetch(`${API_BASE}/drinks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete drink");
        return;
      }
      await fetchDrinks();
    } catch (err) {
      alert("Failed to delete drink: " + String(err));
    }
  };

  // Staff: Add item to order
  const addOrderItem = (drinkId: number): void => {
    const drink = drinks.find((d) => d.id === drinkId);
    if (!drink || drink.stock <= 0) return;

    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.drinkId === drinkId);
      if (existingItem) {
        return prev.map((item) =>
          item.drinkId === drinkId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { drinkId, quantity: 1, price: drink.selling_price }];
      }
    });
  };

  // Staff: Remove item or decrement quantity
  const removeOrderItem = (drinkId: number): void => {
    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.drinkId === drinkId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.drinkId === drinkId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prev.filter((item) => item.drinkId !== drinkId);
      }
    });
  };

  // Staff: Calculate order total
  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Staff: Submit order to backend
  const handleCreateOrder = async (): Promise<void> => {
    if (orderItems.length === 0) {
      alert("Please add items to the order");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems.map((item) => ({
            drinkId: item.drinkId,
            quantity: item.quantity,
          })),
          paymentMethod,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create order");
        return;
      }
      setOrderItems([]);
      await fetchDrinks();
      await fetchGroupedOrders(groupMode);
      alert("Order created successfully");
    } catch (err) {
      alert("Failed to create order: " + String(err));
    }
  };

  // Manager: Change password
  const handleChangePassword = async (username: string, newPassword: string): Promise<void> => {
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to change password");
        return;
      }
      alert("Password updated successfully");
      setNewStaffPassword("");
      setNewManagerPassword("");
      setPasswordChangeSuccess("Password updated successfully");
      setTimeout(() => setPasswordChangeSuccess(""), 3000);
    } catch (err) {
      alert("Failed to change password: " + String(err));
    }
  };

  // CSV generation & download (includes order profit)
  const generateCSV = (orders: Order[]): string => {
    const headers = [
      "Order ID",
      "Item",
      "Quantity",
      "Unit Price",
      "Line Total",
      "Order Total",
      "Order Profit",
      "Payment Method",
      "Date",
    ];
    const rows: string[][] = [];

    orders.forEach((order) => {
      const orderProfit =
        order.profit ??
        (order.items || []).reduce(
          (s, it) => s + ((it.price - (it.buying_price ?? 0)) * it.quantity),
          0
        );
      (order.items || []).forEach((item) => {
        rows.push([
          `#${order.id.toString().slice(-6)}`,
          item.name,
          item.quantity.toString(),
          item.price.toFixed(2),
          (item.price * item.quantity).toFixed(2),
          order.total.toFixed(2),
          orderProfit.toFixed(2),
          order.payment_method,
          new Date(order.timestamp).toLocaleString(),
        ]);
      });
    });

    const csvContent =
      headers.join(",") +
      "\n" +
      rows
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    return csvContent;
  };

  const handleDownloadCSV = (key: string): void => {
    const orders = groupedData.groups[key] || [];
    const csv = generateCSV(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `sales_report_${key}.csv`);
  };

  // Delete order (restore stock handled by backend)
  const handleDeleteOrder = async (orderId: number): Promise<void> => {
    if (!confirm("Are you sure you want to delete this order? This will restore the stock quantities.")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete order");
        return;
      }
      await fetchDrinks();
      await fetchGroupedOrders(groupMode);
      alert("Order deleted and stock restored");
    } catch (err) {
      alert("Failed to delete order: " + String(err));
    }
  };

  // Compute total sales and profit across all groups for manager tiles
  const calcAggregateTotals = (): { total_sales: number; total_profit: number; count: number } => {
    const totals = Object.values(groupedData.group_totals || {}).reduce(
      (acc, t) => {
        acc.total_sales += t.total_sales || 0;
        acc.total_profit += t.total_profit || 0;
        acc.count += t.count || 0;
        return acc;
      },
      { total_sales: 0, total_profit: 0, count: 0 }
    );
    return totals;
  };

  const aggTotals = calcAggregateTotals();

  // Render login page
  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)",
          padding: "1rem",
        }}
      >
        <CardInline
          style={{
            maxWidth: "400px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.5)",
          }}
        >
          <CardHeaderInline style={{ textAlign: "center" }}>
            <CardTitleInline style={{ fontSize: "2rem", color: "#4338ca" }}>
              Club POS System
            </CardTitleInline>
            <p style={{ color: "#4b5563" }}>Login to access the system</p>
          </CardHeaderInline>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <LabelInline htmlFor="username">Username</LabelInline>
              <InputInline
                id="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <LabelInline htmlFor="password">Password</LabelInline>
              <InputInline
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            {loginError && <p style={styles.errorText}>{loginError}</p>}
            <ButtonWithHover onClick={handleLogin} style={{ width: "100%" }}>
              Login
            </ButtonWithHover>
          </div>
        </CardInline>
      </div>
    );
  }

  // Render main app
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
      }}
    >
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerLogo}>C</span> Club POS System
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={styles.welcomeText}>
              Welcome,{" "}
              <strong style={{ textTransform: "capitalize" }}>{currentUser.username}</strong>
              <span style={styles.badgeRole}>{currentUser.role}</span>
            </span>
            <ButtonWithHover
              onClick={handleLogout}
              outline
              style={{ borderColor: "white", color: "white" }}
            >
              Logout
            </ButtonWithHover>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        {currentUser.role === "manager" ? (
          // Manager Dashboard
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            <div style={styles.grid2Responsive}>
              <CardInline
                style={{
                  background: "linear-gradient(to right, #4f46e5, #8b5cf6)",
                  color: "white",
                  padding: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Total Sales</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "700", marginTop: "0.5rem" }}>
                    KSh {aggTotals.total_sales.toLocaleString()}
                  </p>
                </div>
              </CardInline>

              <CardInline
                style={{
                  background: "linear-gradient(to right, #10b981, #059669)",
                  color: "white",
                  padding: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Total Profit</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "700", marginTop: "0.5rem" }}>
                    KSh {aggTotals.total_profit.toLocaleString()}
                  </p>
                </div>
              </CardInline>

              <CardInline
                style={{
                  background: "linear-gradient(to right, #f59e0b, #ea580c)",
                  color: "white",
                  padding: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Total Orders</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "700", marginTop: "0.5rem" }}>
                    {aggTotals.count}
                  </p>
                </div>
              </CardInline>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Inventory Management */}
              <CardInline>
                <CardHeaderInline>
                  <CardTitleInline>Inventory Management</CardTitleInline>
                </CardHeaderInline>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    Add New Drink
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <LabelInline htmlFor="drinkName">Drink Name</LabelInline>
                      <InputInline
                        id="drinkName"
                        value={newDrink.name}
                        onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                        placeholder="Enter drink name"
                      />
                    </div>
                    <div>
                      <LabelInline htmlFor="drinkType">Type</LabelInline>
                      <select
                        id="drinkType"
                        style={styles.select}
                        value={newDrink.type}
                        onChange={(e) =>
                          setNewDrink({ ...newDrink, type: e.target.value as DrinkType })
                        }
                      >
                        <option value="soft">Soft Drink</option>
                        <option value="alcohol">Alcohol</option>
                      </select>
                    </div>
                    <div>
                      <LabelInline htmlFor="stock">Stock Quantity</LabelInline>
                      <InputInline
                        id="stock"
                        type="number"
                        min={0}
                        value={newDrink.stock}
                        onChange={(e) =>
                          setNewDrink({ ...newDrink, stock: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Enter stock"
                      />
                    </div>
                    <div>
                      <LabelInline htmlFor="buyingPrice">Buying Price (KSh)</LabelInline>
                      <InputInline
                        id="buyingPrice"
                        type="number"
                        min={0}
                        value={newDrink.buying_price}
                        onChange={(e) =>
                          setNewDrink({ ...newDrink, buying_price: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Enter buying price"
                      />
                    </div>
                    <div>
                      <LabelInline htmlFor="sellingPrice">Selling Price (KSh)</LabelInline>
                      <InputInline
                        id="sellingPrice"
                        type="number"
                        min={0}
                        value={newDrink.selling_price}
                        onChange={(e) =>
                          setNewDrink({ ...newDrink, selling_price: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Enter selling price"
                      />
                    </div>
                  </div>
                  <ButtonWithHover onClick={handleAddDrink} style={{ marginTop: "1rem" }}>
                    Add Drink
                  </ButtonWithHover>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    Current Inventory
                  </h3>
                  {drinks.length === 0 ? (
                    <p style={{ ...styles.textGray, textAlign: "center", padding: "2rem 0" }}>
                      No drinks in inventory. Add drinks to get started.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Drink</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Stock</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drinks.map((drink) => (
                            <tr
                              key={drink.id}
                              style={{ borderBottom: "1px solid #e0e7ff", cursor: "default" }}
                            >
                              <td style={styles.td}>{drink.name}</td>
                              <td style={styles.td}>
                                <span
                                  style={
                                    drink.type === "alcohol"
                                      ? styles.badgeAlcohol
                                      : styles.badgeSoft
                                  }
                                >
                                  {drink.type}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <InputInline
                                    type="number"
                                    min={0}
                                    value={drink.stock}
                                    onChange={(e) =>
                                      handleUpdateStock(drink.id, parseInt(e.target.value) || 0)
                                    }
                                    style={{ width: "5rem", marginRight: "0.5rem" }}
                                  />
                                  <span>units</span>
                                </div>
                              </td>
                              <td style={styles.td}>KSh {drink.selling_price}</td>
                              <td style={styles.td}>
                                <ButtonWithHover
                                  small
                                  outline
                                  onClick={() => handleDeleteDrink(drink.id)}
                                  style={{ borderColor: "#dc2626", color: "#dc2626" }}
                                >
                                  Delete
                                </ButtonWithHover>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardInline>

              {/* Sales Reports & Password Management */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Sales Reports */}
                <CardInline>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitleInline>Sales Reports</CardTitleInline>
                      <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                        Grouping: {groupMode === "week" ? "Weekly" : "Daily"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <ButtonWithHover
                        small
                        outline
                        onClick={() => setGroupMode("day")}
                        style={{
                          borderColor: groupMode === "day" ? "#fff" : undefined,
                          color: groupMode === "day" ? "#fff" : undefined,
                        }}
                      >
                        Daily
                      </ButtonWithHover>
                      <ButtonWithHover
                        small
                        outline
                        onClick={() => setGroupMode("week")}
                        style={{
                          borderColor: groupMode === "week" ? "#fff" : undefined,
                          color: groupMode === "week" ? "#fff" : undefined,
                        }}
                      >
                        Weekly
                      </ButtonWithHover>
                    </div>
                  </div>

                  {Object.keys(groupedData.groups).length === 0 ? (
                    <p style={{ ...styles.textGray, textAlign: "center", padding: "2rem 0" }}>
                      No sales recorded yet
                    </p>
                  ) : (
                    Object.entries(groupedData.groups).map(([key,   ordersForKey]) => {
                      const totals = groupedData.group_totals[key] || { total_sales: 0, total_profit: 0, count: ordersForKey.length };
                      return (
                        <div key={key} style={{ marginTop: "1rem" }}>
                          <CardInline style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <CardTitleInline style={{ marginBottom: "0.25rem" }}>
                                  {groupMode === "week" ? `Week ${key}` : `Sales on ${new Date(key).toLocaleDateString()}`}
                                </CardTitleInline>
                                <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                                  Orders: {totals.count} — Sales: KSh {totals.total_sales.toLocaleString()} — Profit: KSh {totals.total_profit.toLocaleString()}
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <ButtonWithHover small onClick={() => handleDownloadCSV(key)}>Download CSV</ButtonWithHover>
                              </div>
                            </div>

                            <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
                              <table style={styles.table}>
                                <thead>
                                  <tr>
                                    <th style={styles.th}>Order ID</th>
                                    <th style={styles.th}>Items</th>
                                    <th style={styles.th}>Order Total</th>
                                    <th style={styles.th}>Order Profit</th>
                                    <th style={styles.th}>Payment</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ordersForKey.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #e0e7ff" }}>
                                      <td style={styles.td}>#{order.id.toString().slice(-6)}</td>
                                      <td style={styles.td}>
                                        {order.items.map((item, idx) => (
                                          <div key={idx}>
                                            {item.name} (x{item.quantity}) — KSh {item.price.toFixed(2)}
                                          </div>
                                        ))}
                                      </td>
                                      <td style={{ ...styles.td, fontWeight: 600 }}>KSh {order.total.toFixed(2)}</td>
                                      <td style={{ ...styles.td, fontWeight: 600 }}>KSh {(order.profit ?? 0).toFixed(2)}</td>
                                      <td style={styles.td}>{order.payment_method}</td>
                                      <td style={styles.td}>{new Date(order.timestamp).toLocaleString()}</td>
                                      <td style={styles.td}>
                                        <ButtonWithHover small outline onClick={() => handleDeleteOrder(order.id)} style={{ borderColor: "#dc2626", color: "#dc2626" }}>
                                          Delete
                                        </ButtonWithHover>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardInline>
                        </div>
                      );
                    })
                  )}
                </CardInline>

                {/* Password Management */}
                <CardInline>
                  <CardHeaderInline>
                    <CardTitleInline>Password Management</CardTitleInline>
                  </CardHeaderInline>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                        Change Staff Password
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <InputInline
                          type="password"
                          value={newStaffPassword}
                          onChange={(e) => setNewStaffPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <ButtonWithHover
                          onClick={() => handleChangePassword("staff", newStaffPassword)}
                        >
                          Update
                        </ButtonWithHover>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                        Change Manager Password
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <InputInline
                          type="password"
                          value={newManagerPassword}
                          onChange={(e) => setNewManagerPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <ButtonWithHover
                          onClick={() => handleChangePassword("manager", newManagerPassword)}
                        >
                          Update
                        </ButtonWithHover>
                      </div>
                    </div>

                    {passwordChangeSuccess && (
                      <div style={styles.textSuccess}>{passwordChangeSuccess}</div>
                    )}
                  </div>
                </CardInline>
              </div>
            </div>
          </div>
        ) : (
          // Staff View
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Menu Section */}
            <CardInline>
              <CardHeaderInline>
                <CardTitleInline>Menu</CardTitleInline>
              </CardHeaderInline>
              {drinks.length === 0 ? (
                <p style={{ ...styles.textGray, textAlign: "center", padding: "4rem 0" }}>
                  No drinks available. Please contact manager to add drinks.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {drinks.map((drink) => (
                    <div
                      key={drink.id}
                      style={{
                        border: "1px solid #e0e7ff",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "box-shadow 0.3s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 10px 15px -3px rgba(99, 102, 241, 0.5)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div>
                        <h3 style={{ fontWeight: 600 }}>{drink.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                          <span
                            style={
                              drink.type === "alcohol" ? styles.badgeAlcohol : styles.badgeSoft
                            }
                          >
                            {drink.type}
                          </span>
                          <span style={{ color: "#4b5563", marginLeft: "0.5rem" }}>
                            KSh {drink.selling_price}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                          Stock: {drink.stock}{" "}
                          {drink.stock < 10 && (
                            <span style={styles.lowStockText}>(Low stock)</span>
                          )}
                        </p>
                      </div>
                      <ButtonWithHover
                        onClick={() => addOrderItem(drink.id)}
                        disabled={drink.stock <= 0}
                        style={{ minWidth: "5rem" }}
                      >
                        Add
                      </ButtonWithHover>
                    </div>
                  ))}
                </div>
              )}
            </CardInline>

            {/* Order Section */}
            <CardInline>
              <CardHeaderInline>
                <CardTitleInline>Current Order</CardTitleInline>
              </CardHeaderInline>
              {orderItems.length === 0 ? (
                <p style={{ ...styles.textGray, textAlign: "center", padding: "4rem 0" }}>
                  No items added to order
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ ...styles.scrollY }}>
                    {orderItems.map((item) => {
                      const drink = drinks.find((d) => d.id === item.drinkId);
                      if (!drink) return null;
                      return (
                        <div
                          key={item.drinkId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #e0e7ff",
                            paddingBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <h4 style={{ fontWeight: 500 }}>{drink.name}</h4>
                            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                              KSh {item.price} × {item.quantity}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <ButtonWithHover
                              small
                              outline
                              onClick={() => removeOrderItem(item.drinkId)}
                              style={{ borderColor: "#4338ca", color: "#4338ca" }}
                            >
                              -
                            </ButtonWithHover>
                            <span style={{ width: "2rem", textAlign: "center" }}>
                              {item.quantity}
                            </span>
                            <ButtonWithHover
                              small
                              outline
                              onClick={() => addOrderItem(item.drinkId)}
                              style={{ borderColor: "#4338ca", color: "#4338ca" }}
                            >
                              +
                            </ButtonWithHover>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e0e7ff",
                      paddingTop: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "600",
                      fontSize: "1.125rem",
                    }}
                  >
                    <span>Total:</span>
                    <span>KSh {calculateTotal()}</span>
                  </div>

                  <div>
                    <LabelInline style={{ color: "#374151" }}>Payment Method</LabelInline>
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                          style={styles.radioGroupItem}
                        />
                        Cash
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa"
                          checked={paymentMethod === "mpesa"}
                          onChange={() => setPaymentMethod("mpesa")}
                          style={styles.radioGroupItem}
                        />
                        M-Pesa
                      </label>
                    </div>
                  </div>

                  <ButtonWithHover
                    onClick={handleCreateOrder}
                    disabled={orderItems.length === 0}
                    style={{ width: "100%", marginTop: "1.5rem" }}
                  >
                    Submit Order
                  </ButtonWithHover>
                </div>
              )}
            </CardInline>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "0 1rem" }}>
          <p>Club POS System &copy; {new Date().getFullYear()} - All rights reserved</p>
          <p style={{ color: "#a5b4fc", marginTop: "0.5rem" }}>
            Designed for efficient club management
          </p>
        </div>
      </footer>
    </div>
  );
}