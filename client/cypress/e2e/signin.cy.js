/// <reference types="cypress" />

const defaultValues = {
  password: Cypress.env("VITE_APP_PASSWORD"),
  email: Cypress.env("VITE_APP_EMAIL"),
};

const inputValues = (values) => {
  const { email, password } = values;

  cy.get("[data-cy='email']").type(email);
  cy.get("[data-cy='password']").type(password);
};

describe("Sign In Page", () => {
  beforeEach(() => {
    cy.visit("/signin");
  });

  it("Should a user logged in when input values are valid", () => {
    inputValues(defaultValues);

    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Logged In successfully").should("be.visible");
    cy.url().should("include", "/");
    cy.getCookie("refreshToken").should("exist");
  });

  it("should throw an error when email is not registered", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signin", {
      statusCode: 401,
      body: { statusCode: 401, message: "Email address is not registered" },
    });

    inputValues(defaultValues);

    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Email address is not registered").should("be.visible");
    cy.contains("span", "Email address is not registered").should("be.visible");
  });

  it("should throw an error when password is incorrect", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signin", {
      statusCode: 401,
      body: { statusCode: 401, message: "Incorrect Password" },
    });

    inputValues(defaultValues);

    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Incorrect Password").should("be.visible");
    cy.contains("span", "Incorrect Password").should("be.visible");
  });

  it("should throw an error when password is incorrect", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signin", {
      statusCode: 500,
      body: {
        statusCode: 500,
        message: "Something went wrong try again later",
      },
    });

    inputValues(defaultValues);

    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Something went wrong try again later").should(
      "be.visible",
    );
  });
});
