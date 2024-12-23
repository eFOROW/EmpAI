"use client";

import { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select } from 'antd';

const { Option } = Select;

export default function Career() {
    const [form] = Form.useForm();
    const [certifications, setCertifications] = useState([{ id: 0, name: '', description: '' }]);
    const [isHighSchoolDisabled, setIsHighSchoolDisabled] = useState(false);
    const [isUniversityDisabled, setIsUniversityDisabled] = useState(false);
    const [isGraduateSchoolDisabled, setIsGraduateSchoolDisabled] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const onFinish = (values: any) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const addCertification = () => {
        setCertifications([...certifications, { id: certifications.length, name: '', description: '' }]);
    };

    const removeCertification = (id: number) => {
        if (id !== 0) {
            const updatedCertifications = certifications.filter(cert => cert.id !== id);
            const reindexedCertifications = updatedCertifications.map((cert, index) => ({
                ...cert,
                id: index,
            }));
            setCertifications(reindexedCertifications);
        }
    };

    useEffect(() => {
        const checkIfSubmitEnabled = () => {
            const values = form.getFieldsValue([
                'middleSchoolStatus',
                'highSchoolStatus',
                'universityStatus',
                'graduateSchoolStatus',
            ]);
            const requiredFields = [
                values.middleSchoolStatus,
                values.highSchoolStatus,
                values.universityStatus,
                values.graduateSchoolStatus,
            ];
            // 모든 학적 상태가 선택되었을 때만 제출 버튼을 활성화
            setIsSubmitEnabled(requiredFields.every((field) => field !== undefined && field !== ''));
        };

        checkIfSubmitEnabled();
    }, [form]);

    const handleHighSchoolStatusChange = (value: string) => {
        setIsHighSchoolDisabled(value === '해당없음');
    };

    const handleUniversityStatusChange = (value: string) => {
        setIsUniversityDisabled(value === '해당없음');
    };

    const handleGraduateSchoolStatusChange = (value: string) => {
        setIsGraduateSchoolDisabled(value === '해당없음');
    };

    return (
        <div className="p-10 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">이력 정보 등록</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className="space-y-8"
            >
                {/* 학력 섹션 */}
                <Divider orientation="left" className="text-lg font-medium text-gray-700">학력</Divider>

                {/* 중학교 */}
                <Form.Item name="middleSchoolStatus" label="중학교" className="text-gray-700">
                    <Select placeholder="중학교 학적 상태" className="w-full text-lg" onChange={handleHighSchoolStatusChange} size="large">
                        <Option value="졸업">졸업</Option>
                        <Option value="중퇴">중퇴</Option>
                    </Select>
                </Form.Item>

                {/* 고등학교 */}
                <div className="flex space-x-4">
                    <Form.Item name="highSchoolStatus" label="고등학교 학적 상태" className="text-gray-700 w-1/2">
                        <Select
                            placeholder="고등학교 학적 상태"
                            className="w-full text-lg"
                            onChange={handleHighSchoolStatusChange}
                            size="large"
                        >
                            <Option value="해당없음">해당없음</Option>
                            <Option value="중퇴">중퇴</Option>
                            <Option value="졸업">졸업</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="highSchoolField" label="고등학교 계열" className="w-1/2 text-gray-700">
                        <Select placeholder="계열 선택" className="w-full text-lg" disabled={isHighSchoolDisabled} size="large">
                            <Option value="인문계">인문계</Option>
                            <Option value="이공계">이공계</Option>
                            <Option value="예체능계">예체능계</Option>
                        </Select>
                    </Form.Item>
                </div>

                {/* 대학교 */}
                <div className="flex space-x-4">
                    <Form.Item name="universityStatus" label="대학교 학적 상태" className="text-gray-700 w-1/2">
                        <Select
                            placeholder="대학교 학적 상태"
                            className="w-full text-lg"
                            onChange={handleUniversityStatusChange}
                            size="large"
                        >
                            <Option value="해당없음">해당없음</Option>
                            <Option value="중퇴">중퇴</Option>
                            <Option value="2학년 수료/졸업">2학년 수료/졸업</Option>
                            <Option value="4학년 졸업">4학년 졸업</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="universityMajor" label="대학교 전공" className="w-1/2 text-gray-700">
                        <Input placeholder="대학교 전공" className="w-full text-lg" disabled={isUniversityDisabled} size="large" />
                    </Form.Item>
                </div>

                {/* 대학원 */}
                <div className="flex space-x-4">
                    <Form.Item name="graduateSchoolStatus" label="대학원 학적 상태" className="w-1/2 text-gray-700">
                        <Select
                            placeholder="대학원 학적 상태"
                            className="w-full text-lg"
                            onChange={handleGraduateSchoolStatusChange}
                            size="large"
                        >
                            <Option value="해당없음">해당없음</Option>
                            <Option value="수료">수료</Option>
                            <Option value="졸업">졸업</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="graduateSchoolMajor" label="대학원 전공" className="w-1/2 text-gray-700">
                        <Input placeholder="대학원 전공" className="w-full text-lg" disabled={isGraduateSchoolDisabled} size="large" />
                    </Form.Item>
                </div>

                {/* 자격증 및 수상 내역 */}
                <Divider orientation="left" className="text-lg font-medium text-gray-700">자격증 및 수상 내역</Divider>

                {certifications.map((certification, index) => (
                    <div key={certification.id} className="border border-gray-300 rounded-lg p-6 mb-6">
                        <Form.Item
                            name={['certifications', index, 'name']}
                            label={`자격증/수상 ${index + 1}`}
                            rules={[{ required: true, message: '자격증/수상 이름을 입력해주세요!' }]}
                            className="text-gray-700"
                        >
                            <Input
                                placeholder="자격증/수상 이름"
                                className="w-full text-lg"
                                value={certification.name}
                                onChange={(e) => {
                                    const newCertifications = [...certifications];
                                    newCertifications[index].name = e.target.value;
                                    setCertifications(newCertifications);
                                }}
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item
                            name={['certifications', index, 'description']}
                            label="설명"
                            className="text-gray-700"
                        >
                            <Input
                                placeholder="자격증/수상에 대한 설명"
                                className="w-full text-lg"
                                value={certification.description}
                                onChange={(e) => {
                                    const newCertifications = [...certifications];
                                    newCertifications[index].description = e.target.value;
                                    setCertifications(newCertifications);
                                }}
                                size="large"
                            />
                        </Form.Item>
                        {certifications.length > 1 && index !== 0 && (
                            <Button type="primary" onClick={() => removeCertification(certification.id)} className="mt-4" size="large">
                                삭제
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="dashed" onClick={addCertification} block className="mt-6" size="large">
                    자격증/수상 추가
                </Button>

                {/* 제출 버튼 */}
                <Form.Item className="mt-8">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                        disabled={!isSubmitEnabled}
                        size="large"
                    >저장
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
