import React from "react";

const QuickSignIn = () => {
  return (
    <div
      style={{
        margin: "auto",
        marginTop: "1em",
        padding: "1em",
        borderRadius: "8px",
        backgroundColor: "#28a745",
        color: "white",
        width: "600px",
        maxWidth: "90%",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2
        style={{
          fontSize: "1rem",
          marginBottom: "0.5em",
          fontWeight: "bold",
          color: "white",
        }}
      >
        Quick Signin
      </h2>
      <p
        style={{
          fontSize: ".9rem",
          marginBottom: "1em",
          color: "white",
        }}
      >
        You can use the following password and email to sign in quickly:
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "0.5em",
                fontWeight: "bold",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              Email:
            </td>
            <td
              style={{
                padding: "0.5em",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              visitprime@gmail.com
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "0.5em",
                fontWeight: "bold",
              }}
            >
              Password:
            </td>
            <td
              style={{
                padding: "0.5em",
              }}
            >
              !!Visit1234!!
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuickSignIn;
