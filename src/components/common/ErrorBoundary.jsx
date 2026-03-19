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
    // You can also log the error to an error reporting service like Sentry
    console.group("React Error Boundary Caught an Error");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.groupEnd();
  }

  handleReload = () => {
    // Reset state and try to re-render, or just reload the page for a clean slate
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    const { variant = "full" } = this.props;

    if (this.state.hasError) {
      if (variant === "mini") {
        return (
          <div style={{ padding: '10px', color: '#ff4d4f', background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }}>
            Component failed. <a onClick={this.handleReload}>Retry</a>
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
              <Button key="home" onClick={() => (window.location.href = "/")}>
                Back to Login
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
