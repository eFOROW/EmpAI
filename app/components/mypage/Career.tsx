import { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select } from 'antd';
import { PlusOutlined, TrophyOutlined, BookOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Career() {
    const [form] = Form.useForm();
    const [certifications, setCertifications] = useState([{ id: 0, name: '', description: '' }]);
    const [isHighSchoolDisabled, setIsHighSchoolDisabled] = useState(false);
    const [isUniversityDisabled, setIsUniversityDisabled] = useState(false);
    const [isGraduateSchoolDisabled, setIsGraduateSchoolDisabled] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const onFinish = (values:any) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo:any) => {
        console.log('Failed:', errorInfo);
    };

    const addCertification = () => {
        if (certifications.length < 3) {
            setCertifications([...certifications, { id: certifications.length, name: '', description: '' }]);
        }
    };

    const removeCertification = (id:any) => {
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
                'highSchoolStatus',
                'universityStatus',
                'graduateSchoolStatus',
            ]);
            const requiredFields = [
                values.highSchoolStatus,
                values.universityStatus,
                values.graduateSchoolStatus,
            ];
            setIsSubmitEnabled(requiredFields.every((field) => field !== undefined && field !== ''));
        };

        checkIfSubmitEnabled();
    }, [form]);

    const handleHighSchoolStatusChange = (value:any) => {
        setIsHighSchoolDisabled(value === '해당없음');
    };

    const handleUniversityStatusChange = (value:any) => {
        setIsUniversityDisabled(value === '해당없음');
    };

    const handleGraduateSchoolStatusChange = (value:any) => {
        setIsGraduateSchoolDisabled(value === '해당없음');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-8">
                    <BookOutlined className="text-3xl text-blue-500 mr-4" />
                    <h2 className="text-3xl font-bold text-gray-800">이력 정보 등록</h2>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    className="space-y-6"
                >
                    {/* 학력 섹션 */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <Divider orientation="left" className="text-xl font-semibold text-blue-600">
                            <span className="flex items-center">
                                <BookOutlined className="mr-2" />
                                학력사항
                            </span>
                        </Divider>

                        {/* 고등학교 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item name="highSchoolStatus" label="고등학교 학적 상태" className="text-gray-700">
                                <Select
                                    placeholder="고등학교 학적 상태 선택"
                                    className="w-full"
                                    onChange={handleHighSchoolStatusChange}
                                    size="large"
                                >
                                    <Option value="해당없음">해당없음</Option>
                                    <Option value="중퇴">중퇴</Option>
                                    <Option value="졸업">졸업</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="highSchoolField" label="고등학교 계열" className="text-gray-700">
                                <Select 
                                    placeholder="계열 선택" 
                                    className="w-full" 
                                    disabled={isHighSchoolDisabled}
                                    size="large"
                                >
                                    <Option value="인문계">인문계</Option>
                                    <Option value="이공계">이공계</Option>
                                    <Option value="예체능계">예체능계</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        {/* 대학교 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <Form.Item name="universityStatus" label="대학교 학적 상태" className="text-gray-700">
                                <Select
                                    placeholder="대학교 학적 상태"
                                    className="w-full"
                                    onChange={handleUniversityStatusChange}
                                    size="large"
                                >
                                    <Option value="해당없음">해당없음</Option>
                                    <Option value="중퇴">중퇴</Option>
                                    <Option value="2, 3년 수료/졸업">2, 3년 수료/졸업</Option>
                                    <Option value="4년 졸업">4년 졸업</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="universityMajor" label="대학교 전공" className="md:col-span-2 text-gray-700">
                                <Input 
                                    placeholder="대학교 전공" 
                                    className="w-full" 
                                    disabled={isUniversityDisabled}
                                    size="large" 
                                />
                            </Form.Item>
                        </div>

                        {/* 대학원 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <Form.Item name="graduateSchoolStatus" label="대학원 학적 상태" className="text-gray-700">
                                <Select
                                    placeholder="대학원 학적 상태"
                                    className="w-full"
                                    onChange={handleGraduateSchoolStatusChange}
                                    size="large"
                                >
                                    <Option value="해당없음">해당없음</Option>
                                    <Option value="수료">수료</Option>
                                    <Option value="졸업">졸업</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="graduateSchoolMajor" label="대학원 전공" className="md:col-span-2 text-gray-700">
                                <Input 
                                    placeholder="대학원 전공" 
                                    className="w-full" 
                                    disabled={isGraduateSchoolDisabled}
                                    size="large" 
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* 자격증 및 수상 내역 */}
                    <div className="bg-gray-50 p-6 rounded-lg mt-8">
                        <Divider orientation="left" className="text-xl font-semibold text-blue-600">
                            <span className="flex items-center">
                                <TrophyOutlined className="mr-2" />
                                자격증 및 수상 내역
                            </span>
                        </Divider>

                        {certifications.map((certification, index) => (
                            <div key={certification.id} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700">자격증/수상 #{index + 1}</h3>
                                    {certifications.length > 1 && index !== 0 && (
                                        <Button 
                                            type="text" 
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeCertification(certification.id)}
                                        >
                                            삭제
                                        </Button>
                                    )}
                                </div>
                                <Form.Item
                                    name={['certifications', index, 'name']}
                                    label="자격증/수상명"
                                    rules={[{ required: true, message: '자격증/수상 이름을 입력해주세요!' }]}
                                    className="text-gray-700"
                                >
                                    <Input
                                        placeholder="자격증/수상 이름"
                                        className="w-full"
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
                                    <Input.TextArea
                                        placeholder="자격증/수상에 대한 설명"
                                        className="w-full"
                                        value={certification.description}
                                        onChange={(e) => {
                                            const newCertifications = [...certifications];
                                            newCertifications[index].description = e.target.value;
                                            setCertifications(newCertifications);
                                        }}
                                        size="large"
                                        rows={3}
                                    />
                                </Form.Item>
                            </div>
                        ))}
                        
                        {certifications.length < 3 && (
                            <Button 
                                type="dashed" 
                                onClick={addCertification} 
                                block 
                                className="mt-4"
                                icon={<PlusOutlined />}
                                size="large"
                            >
                                자격증/수상 추가 ({certifications.length}/3)
                            </Button>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <Form.Item className="mt-8">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-lg font-semibold"
                            disabled={!isSubmitEnabled}
                        >
                            저장하기
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}