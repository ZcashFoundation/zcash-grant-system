export const increaseTime = (cy: Cypress.Chainable, ms: number) => {
  console.log("increasetime", ms);
  cy.log("INCREASE TIME", ms + "ms");
  cy.window({ log: false })
    // .then(w => evmIncreaseTime(Math.round(ms / 1000)))
    .then(() => syncTimeWithEvm(cy));
};

export const syncTimeWithEvm = (cy: Cypress.Chainable) => {
  // cy.window({ log: false })
  //   .then(w => {
  //     mineBlock();
  //     return e2eWeb3.eth
  //       .getBlock("latest")
  //       .then((x: any) => x.timestamp * 1000);
  //   })
  //   .then(t => {
  //     cy.log("SYNC TIME WITH EVM", new Date(t).toString());
  //     cy.clock({ log: false }).then(x => x.restore()); // important for repeated calls!
  //     cy.clock(t, ["Date"] as any, { log: false });
  //   });
};
