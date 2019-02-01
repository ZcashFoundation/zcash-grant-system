import React from 'react';
import Exception, { IExceptionProps } from 'ant-design-pro/lib/Exception';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

const actions = (
  <div>
    <Link to="/proposals">
      <Button type="primary">Explore projects</Button>
    </Link>{' '}
    <Link to="/create">
      <Button type="default">Create project</Button>
    </Link>
  </div>
);

const content: { [index: string]: IExceptionProps } = {
  404: {
    title: '404',
    desc: 'Sorry, we could not find the page you were looking for.',
    actions,
    style: { padding: '2rem' },
  },
};

interface Props {
  code: '403' | '404' | '500';
  desc?: string;
}

const ExceptionPage = ({ code, desc }: Props) => (
  <Exception type={code} {...content[code]} desc={desc || content[code].desc} />
);

export default ExceptionPage;
