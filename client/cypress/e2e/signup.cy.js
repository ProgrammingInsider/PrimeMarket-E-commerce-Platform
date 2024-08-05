/// <reference types="cypress" />

const defaultValues = {
  firstname: "Amanuel",
  lastname: "Abera",
  phone: "+251900000000",
  password: "!!Aman1234!!",
  confirmpassword: "!!Aman1234!!",
  city: "Addis Ababa",
  state: "Addis Ababa",
  street: "Africa Avenue",
  country: "Ethiopia",
};

const inputValues = (values) => {
  const {
    firstname,
    lastname,
    phone,
    password,
    confirmpassword,
    city,
    state,
    street,
    country,
  } = values;
  cy.get("[data-cy='firstname']").type(firstname);
  cy.get("[data-cy='lastname']").type(lastname);
  cy.get("[data-cy='email']").type(`testuser_${Date.now()}@example.com`);
  cy.get("[data-cy='phone']").type(phone);
  cy.get("[data-cy='password']").type(password);
  cy.get("[data-cy='confirmpassword']").type(confirmpassword);
  cy.get("[data-cy='city']").type(city);
  cy.get("[data-cy='street']").type(street);
  cy.get("[data-cy='state']").type(state);
  cy.get("[data-cy='country']").type(country);
  cy.get("[data-cy='acceptTerms']").check();
};

describe("Sign Up Page", () => {
  beforeEach(() => {
    cy.visit("/signup");
  });

  it("Should register a new user when input values are valid", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signup", {
      statusCode: 200,
      body: {
        message: "User Registered successfully",
        statusCode: 200,
      },
    });

    inputValues(defaultValues);

    cy.get("[data-cy='acceptTerms']").should("be.checked");
    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "User Registered successfully").should("be.visible");
  });

  it("Should show error when the email is already registered", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signup", {
      statusCode: 409,
      body: {
        message: "Email is already taken",
        statusCode: 409,
      },
    });
    inputValues(defaultValues);

    cy.get("[data-cy='acceptTerms']").should("be.checked");
    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("span", "Email is already taken").should("be.visible");
    cy.contains("div", "Email is already taken").should("be.visible");
  });

  it("Should show error when passwords do not match", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signup", {
      statusCode: 400,
      body: {
        message: "Passwords do not match",
        statusCode: 400,
      },
    });
    inputValues({ ...defaultValues, confirmpassword: "!!Aman123" });

    cy.get("[data-cy='acceptTerms']").should("be.checked");
    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Passwords do not match").should("be.visible");
    cy.contains("span", "Passwords do not match").should("be.visible");
  });

  it("Should show error when something goes wrong", () => {
    cy.intercept("POST", "/api/v1/ecommerce_portfolio/signup", {
      statusCode: 500,
      body: {
        message: "Something went wrong, please try again later",
        statusCode: 500,
      },
    });
    inputValues(defaultValues);

    cy.get("[data-cy='acceptTerms']").should("be.checked");
    cy.get("[type='submit']").should("be.enabled").click();
    cy.contains("div", "Something went wrong, please try again later").should(
      "be.visible",
    );
  });

  it("Should show errors when input values are invalid", () => {
    inputValues({
      ...defaultValues,
      password: "!!aman1234!!",
      confirmpassword: "!!aman1234",
    });

    cy.get("[type='submit']").click();
    cy.contains(
      "Password must contain one uppercase letter, one lowercase letter, one digit, and one special character",
    ).should("be.visible");
    cy.contains("div", "Passwords do not match").should("be.visible");
    cy.contains("span", "Passwords do not match").should("be.visible");
  });
});
