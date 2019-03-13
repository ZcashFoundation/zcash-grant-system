/// <reference types="cypress"/>

describe("auth.recover", () => {
  let stubs: any;
  before(() => {
    cy.request("http://localhost:5000/api/v1/e2e/setup").then(
      r => (stubs = r.body)
    );
  });

  it("should be able to recover account", () => {
    cy.visit("/auth/sign-in");
    cy.title().should("include", "ZF Grants - Sign in");
    cy.get("html").then(el => (el[0].style.scrollBehavior = "auto"));

    cy.contains("a", "Recover your acc").click();
    cy.get("input[placeholder='email address']").type(
      stubs.defaultUser.emailAddress
    );
    cy.contains("button", "Send").click();
    cy.contains("Please check your email ");

    cy.request("http://localhost:5000/api/v1/e2e/email").then(r => {
      const txt = r.body.content.find((x: any) => x.type === "text/plain")
        .value;
      const url = txt.match(/http.*\/email\/recover.*/)[0];
      cy.visit(url);
    });
    cy.contains("Reset");
    cy.get("input[name='password']").type("muhnewpassword");
    cy.get("input[name='passwordConfirm']").type("muhnewpassword");
    cy.contains("Button", "Change pass").click();
    cy.contains("Password has been reset");
    cy.contains("button", "Sign in").click();

    cy.get("input[placeholder='email']")
      .clear()
      .type(stubs.defaultUser.emailAddress);
    cy.get("input[placeholder='password']")
      .clear()
      .type("muhnewpassword");
    cy.contains("button", "Sign in").click();
    cy.contains("default Endtoenderson");
    cy.contains("button", "Edit profile");
  });
});
