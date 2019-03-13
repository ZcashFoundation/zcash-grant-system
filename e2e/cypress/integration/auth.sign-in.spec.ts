/// <reference types="cypress"/>

describe("auth.sign-in", () => {
  let stubs: any;
  before(() => {
    cy.request("http://localhost:5000/api/v1/e2e/setup").then(
      r => (stubs = r.body)
    );
  });
  it("should be able to login", () => {
    cy.visit("/");
    cy.title().should("include", "ZF Grants - Home");
    cy.get("html").then(el => (el[0].style.scrollBehavior = "auto"));

    cy.contains("a", "Sign in").then(x => console.log(stubs));
    cy.contains("a", "Sign in").click();

    cy.get("input[placeholder='email']").type(stubs.defaultUser.emailAddress);
    cy.get("input[placeholder='password']").type(
      stubs.defaultUser.password + "bad"
    );
    cy.contains("button", "Sign in").click();
    cy.contains("Invalid passw");

    cy.get("input[placeholder='email']")
      .clear()
      .type("notin@thesystem.com");
    cy.get("input[placeholder='password']")
      .clear()
      .type(stubs.defaultUser.password);
    cy.contains("button", "Sign in").click();
    cy.contains("No user exists");

    cy.get("input[placeholder='email']")
      .clear()
      .type(stubs.defaultUser.emailAddress);
    cy.get("input[placeholder='password']")
      .clear()
      .type(stubs.defaultUser.password);
    cy.contains("button", "Sign in").click();

    cy.contains("default Endtoenderson");
    cy.contains("button", "Edit profile");

    cy.get(".AuthButton").click();
    cy.contains("a", "Settings").click();
    cy.contains("Account");
    cy.contains("Notifications");
    cy.contains("Change Password");
  });
});
