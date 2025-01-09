'use client'

import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DesktopOutlined,
  CloudServerOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import ServerStatus from '@/app/components/admin/Server-Status';
import WebStatus from '@/app/components/admin/Web-Status';
import ServiceAnalytics from '@/app/components/admin/Service-Analytics';

const { Content, Sider } = Layout;

type MenuTab = 'server' | 'web' | 'analytics';

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<MenuTab>('server');

  const renderContent = () => {
    switch (selectedTab) {
      case 'server':
        return <ServerStatus />;
      case 'web':
        return <WebStatus />;
      case 'analytics':
        return <ServiceAnalytics />;
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={200}
        className="bg-white"
      >
        <Link href="/" className="block relative z-10 m-4">
          <h1 className="font-extrabold text-3xl text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
            EmpAI
          </h1>
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[selectedTab]}
          className="h-full border-0"
          onClick={({ key }) => setSelectedTab(key as MenuTab)}
        >
          <Menu.Item key="server" icon={<CloudServerOutlined />}>
            Server Status
          </Menu.Item>
          <Menu.Item key="web" icon={<DesktopOutlined />}>
            Web Server Status
          </Menu.Item>
          <Menu.Item key="analytics" icon={<AreaChartOutlined />}>
            서비스 분석
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content
          className="m-0 min-h-[280px] bg-white"
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}