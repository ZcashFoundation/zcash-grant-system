import React from 'react';
import { Spin, Card, Row, Col } from 'antd';
import { Charts } from 'ant-design-pro';
import { view } from 'react-easy-state';
import store from '../../store';
import Info from 'components/Info';
import './index.less';

class Financials extends React.Component {
  componentDidMount() {
    store.fetchFinancials();
  }

  render() {
    const { contributions, grants, payouts } = store.financials;
    if (!store.financialsFetched) {
      return <Spin tip="Loading financials..." />;
    }

    return (
      <div className="Financials">
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="Contributions">
              <Charts.Pie
                hasLegend
                title="Contributions"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + contributions.total,
                    }}
                  />
                )}
                data={[
                  { x: 'funded', y: parseFloat(contributions.funded) },
                  { x: 'funding', y: parseFloat(contributions.funding) },
                  { x: 'refunding', y: parseFloat(contributions.refunding) },
                  { x: 'refunded', y: parseFloat(contributions.refunded) },
                  { x: 'staking', y: parseFloat(contributions.staking) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>

            <Card
              size="small"
              title={
                <Info
                  content={
                    <>
                      <p>
                        Matching and bounty obligations for active and completed
                        proposals.
                      </p>
                      <b>matching</b> - total matching amount pleged
                      <br />
                      <b>bounties</b> - total bounty amount pledged
                      <br />
                    </>
                  }
                >
                  Grants
                </Info>
              }
            >
              <Charts.Pie
                hasLegend
                title="Grants"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + grants.total,
                    }}
                  />
                )}
                data={[
                  { x: 'bounties', y: parseFloat(grants.bounty) },
                  { x: 'matching', y: parseFloat(grants.matching) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>

            <Card
              size="small"
              title={
                <Info
                  content={
                    <>
                      <p>Milestone payouts.</p>
                      <b>due</b> - payouts currently accepted but not paid
                      <br />
                      <b>future</b> - payouts that are not yet paid, but expected to be
                      requested in the future
                      <br />
                      <b>paid</b> - total milestone payouts marked as paid, regardless of
                      proposal status
                      <br />
                    </>
                  }
                >
                  Payouts
                </Info>
              }
            >
              <Charts.Pie
                hasLegend
                title="Payouts"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + payouts.total,
                    }}
                  />
                )}
                data={[
                  { x: 'due', y: parseFloat(payouts.due) },
                  { x: 'future', y: parseFloat(payouts.future) },
                  { x: 'paid', y: parseFloat(payouts.paid) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default view(Financials);
