/// <reference types="cypress"/>
import { loadWeb3, randomString, randomHex } from "../helpers";

describe("browse", () => {
  it("should load and be able to browse pages", () => {
    cy.visit("http://localhost:3000", { onBeforeLoad: loadWeb3 });
    cy.title().should("include", "Grant.io - Home");

    // test hero create link
    cy.get('.Home-hero-buttons a[href="/create"]')
      // {force: true} here overcomes a strange issue where the button moves up under the header
      // this is likely a cypress-related problem
      .click({ force: true });
    cy.title().should("include", "Grant.io - Create a Proposal");

    // browse back home
    cy.get('.Header a[href="/"]').click();

    // test hero explore link
    cy.get('.Home-hero-buttons a[href="/proposals"]')
      // {force: true} here overcomes a strange issue where the button moves up under the header
      // this is likely a cypress-related problem
      .click({ force: true });
    cy.title().should("include", "Grant.io - Browse proposals");

    // browse back home
    cy.get('.Header a[href="/"]').click();

    // browse to create via header link
    cy.get('.Header a[href="/create"]').click();
    cy.title().should("include", "Grant.io - Create a Proposal");

    // browse to explore via header link
    cy.get('.Header a[href="/proposals"]').click();
    cy.title().should("include", "Grant.io - Browse proposals");

    // browse footer links
    cy.get('.Footer a[href="/about"]').click();
    cy.title().should("include", "Grant.io - About");
    cy.get('.Footer a[href="/contact"]').click();
    cy.title().should("include", "Grant.io - Contact");
    cy.get('.Footer a[href="/tos"]').click();
    cy.title().should("include", "Grant.io - Terms of Service");
    cy.get('.Footer a[href="/privacy"]').click();
    cy.title().should("include", "Grant.io - Privacy Policy");
  });
});
