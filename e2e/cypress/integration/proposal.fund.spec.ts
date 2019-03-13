/// <reference types="cypress"/>

describe("proposal.fund", () => {
  let stubs: any;
  before(() => {
    cy.request("http://localhost:5000/api/v1/e2e/setup").then(
      r => (stubs = r.body)
    );
  });

  it("should be able to make anonymous contributions", () => {
    cy.visit("/proposals");
    cy.title().should("include", "ZF Grants - Browse proposals");
    cy.get("html").then(el => (el[0].style.scrollBehavior = "auto"));

    cy.contains(".ant-radio-wrapper", "Funding req").click();
    cy.contains(
      ".ProposalCard",
      "Fake Proposal #11 COMMUNITY FUNDING_REQUIRED"
    ).click();

    cy.get("input[name='amountToRaise']").type("100");
    cy.contains("Cannot exceed maximum");
    cy.get("input[name='amountToRaise']")
      .clear()
      .type("23.456");
    cy.contains("button", "Fund this").click();
    cy.contains("anonymous");
    cy.contains("button", "I accept").click();
    cy.contains("button", "I’ve sent it").click();
    cy.contains("button", "Done").click();
  });

  it("should be able to make contributions", () => {
    cy.visit("/auth/sign-in");
    cy.get("html").then(el => (el[0].style.scrollBehavior = "auto"));

    // login
    cy.get("input[placeholder='email']")
      .clear()
      .type(stubs.defaultUser.emailAddress);
    cy.get("input[placeholder='password']")
      .clear()
      .type(stubs.defaultUser.password);
    cy.contains("button", "Sign in").click();

    cy.contains("default Endtoenderson");

    cy.contains("a", "Proposals").click();
    cy.title().should("include", "ZF Grants - Browse proposals");
    cy.contains(".ant-radio-wrapper", "Funding req").click();
    cy.contains(
      ".ProposalCard",
      "Fake Proposal #11 COMMUNITY FUNDING_REQUIRED"
    ).click();

    cy.get("input[name='amountToRaise']").type("23.456");
    cy.contains("button", "Fund this").click();
    cy.contains("Make your contribution");
    cy.contains("button", "I’ve sent it").click();
    cy.contains("a", "funded tab").click();
    cy.contains(".ant-tabs-tab-active", "Funded");
    cy.contains(
      ".ProfileContribution",
      "Fake Proposal #11 COMMUNITY FUNDING_REQUIRED"
    );
    cy.contains(".ProfileContribution", "23.456");

    cy.request("http://localhost:5000/api/v1/e2e/contribution/confirm");
    cy.contains(
      ".ProfileContribution a",
      "Fake Proposal #11 COMMUNITY FUNDING_REQUIRED"
    ).click();
    cy.contains("Proposal has been funded");
    cy.contains("a", "default Endtoenderson").click();
  });
});
