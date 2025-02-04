import { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select } from 'antd';
import { PlusOutlined, TrophyOutlined, BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

interface CareerFormProps {
    onSubmit: (values: any) => void;
    initialValues?: any;
}

const CareerForm = ({ onSubmit, initialValues }: CareerFormProps) => {
    const [form] = Form.useForm();
    
    const [certifications, setCertifications] = useState<Array<{id: number, name: string, description: string}>>(() => {
        if (initialValues?.certifications && Array.isArray(initialValues.certifications)) {
            return initialValues.certifications.map((cert: any, index: number) => ({
                id: index,
                name: cert.name || '',
                description: cert.description || ''
            }));
        }
        return [{ id: 0, name: '', description: '' }];
    });

    const [isHighSchoolDisabled, setIsHighSchoolDisabled] = useState(initialValues?.highSchoolStatus === '해당없음');
    const [isUniversityDisabled, setIsUniversityDisabled] = useState(initialValues?.universityStatus === '해당없음');
    const [isGraduateSchoolDisabled, setIsGraduateSchoolDisabled] = useState(initialValues?.graduateSchoolStatus === '해당없음');

    useEffect(() => {
        if (initialValues) {
            try {
                const safeInitialValues = {
                    highSchoolStatus: initialValues.highSchoolStatus || '',
                    highSchoolField: initialValues.highSchoolField || '',
                    universityStatus: initialValues.universityStatus || '',
                    universityMajor: initialValues.universityMajor || '',
                    graduateSchoolStatus: initialValues.graduateSchoolStatus || '',
                    graduateSchoolMajor: initialValues.graduateSchoolMajor || '',
                    certifications: initialValues.certifications || []
                };

                form.setFieldsValue(safeInitialValues);

                setIsHighSchoolDisabled(safeInitialValues.highSchoolStatus === '해당없음');
                setIsUniversityDisabled(safeInitialValues.universityStatus === '해당없음');
                setIsGraduateSchoolDisabled(safeInitialValues.graduateSchoolStatus === '해당없음');

                if (Array.isArray(initialValues.certifications) && initialValues.certifications.length > 0) {
                    setCertifications(
                        initialValues.certifications.map((cert: any, index: number) => ({
                            id: index,
                            name: cert.name || '',
                            description: cert.description || ''
                        }))
                    );
                }
            } catch (error) {
                console.error('폼 데이터 초기화 중 오류 발생:', error);
            }
        }
    }, [initialValues, form]);

    // 기존 함수들 유지
    const onFinish = (values: any) => {
        console.log('Success:', values);
        onSubmit(values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const addCertification = () => {
        if (certifications.length < 3) {
            setCertifications([...certifications, { id: certifications.length, name: '', description: '' }]);
        }
    };

    const removeCertification = (id: any) => {
        if (id !== 0) {
            const updatedCertifications = certifications.filter(cert => cert.id !== id);
            const reindexedCertifications = updatedCertifications.map((cert, index) => ({
                ...cert,
                id: index,
            }));
            setCertifications(reindexedCertifications);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (errorInfo) {
            console.error('유효성 검사 실패:', errorInfo);
        }
    };

    const handleFormChange = (changedValues: any, allValues: any) => {
        const { highSchoolStatus, universityStatus, graduateSchoolStatus } = allValues;
    };

    const handleHighSchoolStatusChange = (value: any) => {
        setIsHighSchoolDisabled(value === '해당없음');
        if (value === '해당없음') {
            form.setFieldValue('highSchoolField', undefined);
        }
    };

    const handleUniversityStatusChange = (value: any) => {
        setIsUniversityDisabled(value === '해당없음');
        if (value === '해당없음') {
            form.setFieldValue('universityMajor', undefined);
        }
    };

    const handleGraduateSchoolStatusChange = (value: any) => {
        setIsGraduateSchoolDisabled(value === '해당없음');
        if (value === '해당없음') {
            form.setFieldValue('graduateSchoolMajor', undefined);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-2 py-2"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className="space-y-8"
                onValuesChange={handleFormChange}
                initialValues={initialValues}
            >
                {/* 학력 섹션 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-4">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <BookOutlined className="mr-3" />
                            학력사항
                        </h2>
                        <p className="text-blue-100 mt-2">교육 이력을 입력해주세요</p>
                    </div>

                    <div className="p-8">
                        {/* 고등학교 */}
                        <div className="bg-gray-50 rounded-xl p-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">고등학교</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item 
                                    name="highSchoolStatus" 
                                    label="학적 상태" 
                                    className="text-gray-700"
                                    rules={[{ required: true, message: '고등학교 학적 상태를 선택해주세요' }]}
                                >
                                    <Select
                                        placeholder="학적 상태 선택"
                                        className="w-full"
                                        onChange={handleHighSchoolStatusChange}
                                        size="large"
                                    >
                                        <Option value="해당없음">해당없음</Option>
                                        <Option value="재학중">재학중</Option>
                                        <Option value="중퇴">중퇴</Option>
                                        <Option value="졸업">졸업</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item 
                                    name="highSchoolField" 
                                    label="계열" 
                                    className="text-gray-700"
                                    rules={[{ required: true, message: '고등학교 계열을 선택해주세요' }]}
                                >
                                    <Select 
                                        placeholder="계열 선택" 
                                        className="w-full" 
                                        disabled={isHighSchoolDisabled}
                                        size="large"
                                    >
                                        <Option value="인문계">인문계</Option>
                                        <Option value="이공계">자연계</Option>
                                        <Option value="예체능계">예체능계</Option>
                                        <Option value="검정고시">검정고시</Option>
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        {/* 대학교 */}
                        <div className="bg-gray-50 rounded-xl p-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">대학교</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Form.Item 
                                    name="universityStatus" 
                                    label="학적 상태" 
                                    className="text-gray-700"
                                    rules={[{ required: true, message: '대학교 학적 상태를 선택해주세요' }]}
                                >
                                    <Select
                                        placeholder="학적 상태"
                                        className="w-full"
                                        onChange={handleUniversityStatusChange}
                                        size="large"
                                    >
                                        <Option value="해당없음">해당없음</Option>
                                        <Option value="재학중">재학중</Option>
                                        <Option value="중퇴">중퇴</Option>
                                        <Option value="2,3년 수료/졸업">2,3년 수료/졸업</Option>
                                        <Option value="4년 졸업">4년 졸업</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item 
                                    name="universityMajor" 
                                    label="전공" 
                                    className="md:col-span-2 text-gray-700"
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                const universityStatus = form.getFieldValue('universityStatus');
                                                if (universityStatus !== '해당없음' && !value) {
                                                    return Promise.reject('대학교 전공을 입력해주세요.');
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input 
                                        placeholder="전공을 입력하세요" 
                                        className="w-full" 
                                        disabled={isUniversityDisabled}
                                        size="large" 
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* 대학원 */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">대학원</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Form.Item 
                                    name="graduateSchoolStatus" 
                                    label="학적 상태" 
                                    className="text-gray-700"
                                    rules={[{ required: true, message: '대학원 학적 상태를 선택해주세요' }]}
                                >
                                    <Select
                                        placeholder="학적 상태"
                                        className="w-full"
                                        onChange={handleGraduateSchoolStatusChange}
                                        size="large"
                                    >
                                        <Option value="해당없음">해당없음</Option>
                                        <Option value="재학중">재학중</Option>
                                        <Option value="수료">수료</Option>
                                        <Option value="졸업">졸업</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item 
                                    name="graduateSchoolMajor" 
                                    label="전공" 
                                    className="md:col-span-2 text-gray-700"
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                const universityStatus = form.getFieldValue('graduateSchoolStatus');
                                                if (universityStatus !== '해당없음' && !value) {
                                                    return Promise.reject('대학원 전공을 입력해주세요.');
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input 
                                        placeholder="전공을 입력하세요" 
                                        className="w-full" 
                                        disabled={isGraduateSchoolDisabled}
                                        size="large" 
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 자격증 및 수상 내역 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <TrophyOutlined className="mr-3" />
                            자격증 및 수상 내역
                        </h2>
                        <p className="text-purple-100 mt-2">최대 3개까지 등록 가능합니다</p>
                    </div>

                    <div className="p-2">
                        <AnimatePresence>
                            {certifications.map((certification, index) => (
                                <motion.div
                                    key={certification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-gray-50 rounded-xl p-3 mb-3"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">
                                            자격증/수상 #{index + 1}
                                        </h3>
                                        {certifications.length > 1 && index !== 0 && (
                                            <Button 
                                                type="text" 
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeCertification(certification.id)}
                                                className="hover:bg-red-50"
                                            >
                                                삭제                                            </Button>
                                        )}
                                    </div>

                                    <Form.Item
                                        name={['certifications', index, 'name']}
                                        label="자격증/수상 이름"
                                        className="text-gray-700"
                                        rules={[{ required: true, message: '자격증 또는 수상 이름을 입력해주세요.' }]}
                                    >
                                        <Input placeholder="예: 정보처리기사" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        name={['certifications', index, 'description']}
                                        label="설명"
                                        className="text-gray-700"
                                        rules={[{ required: true, message: '자격증 또는 수상 설명을 입력해주세요.' }]}
                                    >
                                        <Input placeholder="예: 2023년 취득, 한국산업인력공단" size="large" />
                                    </Form.Item>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {certifications.length < 3 && (
                            <Button 
                                type="dashed" 
                                onClick={addCertification} 
                                className="w-full flex items-center justify-center py-2 text-lg"
                                icon={<PlusOutlined />}
                            >
                                추가하기
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* 제출 버튼 */}
                <div className="flex justify-end mt-8">
                    <Button type="primary" size="large" onClick={handleSubmit}>
                        저장하기
                    </Button>
                </div>
            </Form>
        </motion.div>
    );
};

export default CareerForm;