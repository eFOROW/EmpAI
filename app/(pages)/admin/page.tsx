'use client'

import { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  DesktopOutlined,
  CloudServerOutlined,
  AreaChartOutlined,
  LockOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import ServerStatus from '@/app/components/admin/Server-Status';
import WebStatus from '@/app/components/admin/Web-Status';
import DBStatus from '@/app/components/admin/DB-Status';
import ServiceAnalytics from '@/app/components/admin/Service-Analytics';

const { Content, Sider } = Layout;

type MenuTab = 'server' | 'web' | 'analytics' | 'db';

// 허용된 관리자 UID 목록
const ALLOWED_ADMIN_UIDS = ['qGmWLRZX8xdYlAbXNiTitsdq6mY2', 'D5z4xFJiekWCR6HjDNCu3qR6KAX2'];

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<MenuTab>('server');
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setIsAuthChecked(true);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={250} className="bg-white">
          <div className="block relative z-10 m-4">
            <div className="font-extrabold text-3xl text-blue-600">EmpAI</div>
          </div>
        </Sider>
        <Layout>
          <Content className="m-0 min-h-[280px] bg-white" />
        </Layout>
      </Layout>
    );
  }

  const renderContent = () => {
    switch (selectedTab) {
      case 'server':
        return <ServerStatus />;
      case 'web':
        return <WebStatus />;
      case 'analytics':
        return <ServiceAnalytics />;
      case 'db':
        return <DBStatus />;
    }
  };

  const menuItems = [
    {
      key: 'server',
      icon: <CloudServerOutlined />,
      label: 'Server Status',
      style: { height: '50px', lineHeight: '60px' }
    },
    {
      key: 'web',
      icon: <DesktopOutlined />,
      label: 'Web Server Status',
      style: { height: '50px', lineHeight: '60px' }
    },
    {
      key: 'analytics',
      icon: <AreaChartOutlined />,
      label: 'Service Analytics',
      style: { height: '50px', lineHeight: '60px' }
    },
    {
      key: 'db',
      icon: <DatabaseOutlined />,
      label: 'DataBase Status',
      style: { height: '50px', lineHeight: '60px' }
    }
  ];

  return (
    <>
      {isAuthChecked && (!user || !ALLOWED_ADMIN_UIDS.includes(user.uid)) ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <LockOutlined className="text-4xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">관리자 권한이 필요합니다</h2>
              <p className="text-gray-600 mb-6">
                이 페이지는 관리자 전용 페이지입니다.<br />
                접근 권한이 없습니다.
              </p>
              <Button
                onClick={() => router.push('/')}
                type="primary"
                size="large"
                className="h-12 px-10 text-lg bg-blue-500 hover:bg-blue-600 border-0 rounded-lg"
              >
                메인으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            width={250}
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
              className="h-full border-0 mt-10"
              onClick={({ key }) => setSelectedTab(key as MenuTab)}
              items={menuItems}
            />
          </Sider>
          <Layout>
            <Content
              className="m-0 min-h-[280px] bg-white"
            >
              {renderContent()}
            </Content>
          </Layout>
        </Layout>
      )}
    </>
  );
}