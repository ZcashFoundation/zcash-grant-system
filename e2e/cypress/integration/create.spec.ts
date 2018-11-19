/// <reference types="cypress"/>
import { loadWeb3, randomString, randomHex } from "../helpers";

describe("create proposal", () => {
  it("should load and be able to browse pages", () => {
    cy.visit("http://localhost:3000/create", { onBeforeLoad: loadWeb3 });

    // populate ethAccounts
    cy.wait(1000);
    cy.window()
      .then(w => (w as any).web3.eth.getAccounts())
      .as("EthAccounts");

    // demo proposal
    // cy.get("button.CreateFlow-footer-example").click();

    const time = new Date().toLocaleString();
    const id = randomString();
    const randomEthHex = randomHex(32);
    const nextYear = new Date().getUTCFullYear() + 1;
    const proposal = {
      title: "e2e - smoke - create " + time,
      brief: "e2e brief",
      category: "Community", // .anticon-team
      target: 5,
      content: `#### e2e Proposal ${id} {enter} **created** ${time} `,
      team: [
        {
          name: "Alisha Endtoend",
          title: "QA Robot0",
          accountAddress: `0x0000${randomEthHex}0000`,
          emailAddress: `qa.alisha.${id}@grant.io`
        },
        {
          name: "Billy Endtoend",
          title: "QA Robot1",
          accountAddress: `0x1111${randomEthHex}1111`,
          emailAddress: `qa.billy.${id}@grant.io`
        }
      ],
      milestones: [
        {
          title: `e2e Milestone ${id} 0`,
          content: `e2e Milestone ${id} {enter} body 0`,
          date: {
            y: nextYear,
            m: "Jan",
            expect: "January " + nextYear
          }
        },
        {
          title: `e2e Milestone ${id} 1`,
          content: `e2e Milestone ${id} {enter} body 1`,
          date: {
            y: nextYear,
            m: "Feb",
            expect: "February " + nextYear
          }
        }
      ]
    };

    // step 1
    cy.get('.CreateFlow input[name="title"]', { timeout: 20000 }).type(
      proposal.title
    );
    cy.get('.CreateFlow textarea[name="brief"]').type(proposal.brief);
    cy.contains("Select a category").click();
    cy.get(".ant-select-dropdown li .anticon-team").click();
    cy.get('.CreateFlow input[name="target"]').type(
      "" + proposal.target
    );
    cy.get(".CreateFlow-footer-button")
      .contains("Continue")
      .as("Continue")
      .click();

    // step 2
    cy.get('.TeamMember-info input[name="name"]').type(proposal.team[0].name);
    cy.get('.TeamMember-info input[name="title"]').type(proposal.team[0].title);
    cy.get("@EthAccounts").then(accts => {
      cy.get('.TeamMember-info input[name="accountAddress"]').type(
        accts[0].toString()
      );
    });
    cy.get('.TeamMember-info input[name="emailAddress"]').type(
      proposal.team[0].emailAddress
    );
    cy.get("button")
      .contains("Save changes")
      .click({ force: true });

    cy.get("button.TeamForm-add").click();
    cy.get('.TeamMember-info input[name="name"]').type(proposal.team[1].name);
    cy.get('.TeamMember-info input[name="title"]').type(proposal.team[1].title);
    cy.get("@EthAccounts").then(accts => {
      cy.get('.TeamMember-info input[name="accountAddress"]').type(
        accts[1].toString()
      );
    });
    cy.get('.TeamMember-info input[name="emailAddress"]').type(
      proposal.team[1].emailAddress
    );
    cy.get("button")
      .contains("Save changes")
      .click({ force: true });

    cy.wait(1000);
    cy.get("@Continue").click();

    // step 3
    cy.get(".DraftEditor-editorContainer > div").type(proposal.content);
    cy.get(".mde-tabs > :nth-child(2)").click();

    cy.wait(1000);
    cy.get("@Continue").click();

    // step 4
    cy.get('input[name="title"]').type(proposal.milestones[0].title);
    cy.get('textarea[name="content"]').type(proposal.milestones[0].content);
    cy.get('input[placeholder="Expected completion date"]').click();
    cy.get(".ant-calendar-month-panel-next-year-btn").click();
    cy.get(".ant-calendar-month-panel-month")
      .contains(proposal.milestones[0].date.m)
      .click();
    cy.get(".ant-calendar-picker-input").should(
      "have.value",
      proposal.milestones[0].date.expect
    );

    cy.get("button")
      .contains("Add another milestone")
      .click({ force: true });

    cy.get('input[name="title"]')
      .eq(1)
      .type(proposal.milestones[1].title);
    cy.get('textarea[name="content"]')
      .eq(1)
      .type(proposal.milestones[1].content);
    cy.get('input[placeholder="Expected completion date"]')
      .eq(1)
      .click();
    cy.get(".ant-calendar-month-panel-next-year-btn").click();
    cy.get(".ant-calendar-month-panel-month")
      .contains(proposal.milestones[1].date.m)
      .click();
    cy.get(".ant-calendar-picker-input")
      .eq(1)
      .should("have.value", proposal.milestones[1].date.expect);

    cy.wait(1000);
    cy.get("@Continue").click();

    // step 5
    cy.window()
      .then(w => (w as any).web3.eth.getAccounts())
      .then(accts => {
        cy.get('input[name="payOutAddress"]').type(accts[0]);
        cy.get("button")
          .contains("Add another trustee")
          .click({ force: true });
        cy.get(
          'input[placeholder="0x8B0B72F8bDE212991135668922fD5acE557DE6aB"]'
        )
          .eq(1)
          .type(accts[1]);
        cy.get('input[name="deadline"][value="2592000"]').click({
          force: true
        });
        cy.get('input[name="milestoneDeadline"][value="259200"]').click({
          force: true
        });
      });

    cy.wait(1000);
    cy.get("@Continue").click();

    // final
    cy.get("button")
      .contains("Publish")
      .click();
    cy.get(".CreateFinal-loader-text").contains("Deploying contract...");

    cy.get(".CreateFinal-message-text a", { timeout: 20000 })
      .contains("Click here")
      .click();

    // done
    cy.get(".Proposal-top-main-title").contains(proposal.title);
  });
});
