import React from 'react';
import { Spin, Card, Row, Col, Dropdown, Button, Icon, Menu } from 'antd';
import { Charts } from 'ant-design-pro';
import { view } from 'react-easy-state';
import store from '../../store';
import Info from 'components/Info';
import { formatUsd } from '../../util/formatters';
import './index.less';

interface State {
  selectedYear: string;
}

class Financials extends React.Component<{}, State> {
  state: State = {
    selectedYear: '',
  };

  async componentDidMount() {
    await store.fetchFinancials();

    const years = Object.keys(store.financials.payoutsByQuarter);
    const selectedYear = years[years.length - 1];

    this.setState({
      selectedYear,
    });
  }

  render() {
    const { selectedYear } = this.state;
    const { grants, payouts, payoutsByQuarter } = store.financials;
    if (!store.financialsFetched || !selectedYear) {
      return <Spin tip="Loading financials..." />;
    }

    const years = Object.keys(store.financials.payoutsByQuarter);
    const quarterData = payoutsByQuarter[this.state.selectedYear];

    const payoutsByQuarterMenu = (
      <Menu onClick={e => this.setState({ selectedYear: e.key })}>
        {years.map(year => (
          <Menu.Item key={year}>{year}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className="Financials">
        <Row gutter={16}>
          <Col lg={8} md={12} sm={24}>
            <Card size="small" title={'Grants'}>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div>Bounties Total</div>
                <div style={{ fontSize: '2rem' }}>{`$ ${formatUsd(
                  grants.total,
                  false,
                  2,
                )}`}</div>
              </div>
            </Card>
          </Col>

          <Col lg={8} md={12} sm={24}>
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
                      __html: '$ ' + formatUsd(grants.total, false),
                    }}
                  />
                )}
                data={[
                  { x: 'due', y: parseFloat(payouts.due) },
                  { x: 'future', y: parseFloat(payouts.future) },
                  { x: 'paid', y: parseFloat(payouts.paid) },
                ]}
                valueFormat={val => (
                  <span
                    dangerouslySetInnerHTML={{ __html: `${formatUsd(val, true, 2)}` }}
                  />
                )}
                height={180}
              />
            </Card>
          </Col>

          <Col lg={8} md={12} sm={24}>
            <Card
              size="small"
              title={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Info
                    content={
                      <>
                        <p>
                          Milestone payouts broken down by quarter. Use the dropdown to
                          select a different year.
                        </p>
                      </>
                    }
                  >
                    Payouts by Quarter
                  </Info>
                  <Dropdown overlay={payoutsByQuarterMenu} trigger={['click']}>
                    <Button>
                      {this.state.selectedYear} <Icon type="down" />
                    </Button>
                  </Dropdown>
                </div>
              }
            >
              <Charts.Pie
                hasLegend
                title="Contributions"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: '$ ' + formatUsd(quarterData.yearTotal, false, 2),
                    }}
                  />
                )}
                data={[
                  { x: 'Q1', y: parseFloat(quarterData.q1) },
                  { x: 'Q2', y: parseFloat(quarterData.q2) },
                  { x: 'Q3', y: parseFloat(quarterData.q3) },
                  { x: 'Q4', y: parseFloat(quarterData.q3) },
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
