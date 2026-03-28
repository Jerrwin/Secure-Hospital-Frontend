import React from "react";
import { Result, Button } from "antd";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // logs to show the errors in the console for debugging purposes
    console.group("React Error Boundary Caught an Error");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.groupEnd();
  }

  handleReload = () => {
    // Standard browser reload for a clean slate
    window.location.reload();
  };

  render() {
    const { variant = "full" } = this.props;

    if (this.state.hasError) {
      if (variant === "mini") {
        return (
          <div
            style={{
              padding: "10px",
              color: "#ff4d4f",
              background: "#fff1f0",
              border: "1px solid #ffccc7",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "12px",
            }}
          >
            Component failed.{" "}
            <button
              onClick={this.handleReload}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                fontSize: "inherit",
              }}
            >
              Reload
            </button>
          </div>
        );
      }

      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            background: "#f8fafc",
            borderRadius: "12px",
          }}
        >
          <Result
            status="error"
            title="Something went wrong"
            subTitle={
              this.state.error?.message ||
              "An unexpected error occurred while rendering this component."
            }
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Reload Page
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
