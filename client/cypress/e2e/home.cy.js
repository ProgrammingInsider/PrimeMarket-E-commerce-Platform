/// <reference types="cypress" />

describe("Home Page", () => {
  beforeEach(() => {
    // Login first

    // Load categories fixture
    cy.fixture("categories.json").then((categories) => {
      cy.log("Loaded categories fixture");
      cy.intercept("GET", "/api/v1/ecommerce_portfolio/productcategory", {
        body: categories,
      }).as("getCategories");
    });

    // Load products fixture
    cy.fixture("products.json").then((products) => {
      cy.log("Loaded products fixture");
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/products?categoryid=&parentcategory=&rating=&lowprice=&highprice=&sort=&search=",
        {
          body: products,
        },
      ).as("getProducts");
    });

    // Load products fixture
    cy.fixture("products.json").then((products) => {
      cy.log("Loaded products fixture");
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/products?categoryid=&parentcategory=All&rating=&lowprice=&highprice=&sort=&search=",
        {
          body: products,
        },
      ).as("getProducts");
    });

    // Load electronics fixture
    cy.fixture("electronics.json").then((electronics) => {
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/products?categoryid=&parentcategory=669bd2dc3377976616749db0&rating=&lowprice=&highprice=&sort=&search=",
        {
          body: electronics,
        },
      ).as("getByParentCategory");
    });

    // Load smartphones fixture
    cy.fixture("smartphones.json").then((phone) => {
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/products?categoryid=669bd33d3377976616749db3&parentcategory=669bd2dc3377976616749db0&rating=4&lowprice=1100&highprice=2000&sort=&search=",
        {
          body: phone,
        },
      ).as("filterByAll");
    });

    // Visit the home page
    cy.visit("/");
  });

  it("should display filters and products", () => {
    // Wait for network requests to complete
    cy.wait("@getCategories");
    cy.wait("@getProducts");

    // Check for the presence of filters and products
    cy.contains(/prime/i).should("be.visible");
    cy.contains("4 results").should("be.visible");

    // Product Name
    cy.contains("Canon EOS R5").should("be.visible");
    cy.contains("Chanel No. 5").should("be.visible");
    cy.contains("iphone 14 pro max").should("be.visible");
    cy.contains("apple macbook air m2").should("be.visible");

    // Reviews
    cy.contains("0 reviews").should("be.visible");
    cy.contains("1 reviews").should("be.visible");
    cy.contains("3 reviews").should("be.visible");
    cy.contains("2 reviews").should("be.visible");

    // Price
    cy.contains(3899.99).should("be.visible");
    cy.contains(199.99).should("be.visible");
    cy.contains(1199.99).should("be.visible");
  });

  it("should filter products by parent category", () => {
    cy.contains("Electronics").click();

    // Wait for the intercepted request
    cy.wait("@getByParentCategory").then((interception) => {
      console.log("Request made:", interception);
    });

    // Assertions
    cy.contains("span", "Electronics").should("be.visible");
    cy.contains("3 results").should("be.visible");
    cy.contains("Canon EOS R5").should("be.visible");
    cy.contains("iphone 14 pro max").should("be.visible");
    cy.contains("apple macbook air m2").should("be.visible");
  });

  it("should filter products by All filter options", () => {
    // Perform actions that trigger the request
    cy.contains("Electronics").click();

    cy.get("[data-cy='higherPrice']").type(2000);
    cy.get("[data-cy='lowerPrice']").type(1100);
    cy.get("[data-cy='4 star']").click();

    // Wait for the intercepted request
    cy.wait("@getByParentCategory").then((interception) => {
      console.log("Request made:", interception);
    });
    cy.contains("Smartphones").click();
    // Wait for the intercepted request
    cy.wait("@filterByAll");

    // Assertions
    cy.contains("span", "Smartphones").should("be.visible");
    cy.contains("1 result").should("be.visible");
    cy.contains("iphone 14 pro max").should("be.visible");
    cy.get("body").should("not.contain", "apple macbook air m2");
    cy.get("body").should("not.contain", "Canon EOS R5");
  });

  it("should Clear all filtered options when user clicked on clearAll button", () => {
    // Perform actions that trigger the request
    cy.contains("Electronics").click();
    cy.contains("Smartphones").click();
    cy.get("[data-cy='higherPrice']").type(2000);
    cy.get("[data-cy='lowerPrice']").type(1100);
    cy.get("[data-cy='4 star']").click();

    // Wait for the intercepted request
    cy.wait("@filterByAll");

    cy.get("[data-cy='clearAll']").click();

    // Assertions
    cy.get("li").should("not.contain", "Category:Smartphones");
    cy.get("li").should("not.contain", "Lower_Price:1100");
    cy.get("li").should("not.contain", "Higher_Price:4000");
    cy.get("li").should("not.contain", "Ratings:4 star");
    cy.get("span").should("not.contain", "Smartphones");
    cy.get("span").should("not.contain", "Laptops");
    cy.get("span").should("not.contain", "Cameras");
    cy.get("li").should("contain", "Category:All");
  });
});
