import { BookOutlined } from '@ant-design/icons';
import CareerForm from './Career_Form';
import { User } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { message } from 'antd';

interface MyProfileProps {
    user: User | null;
}

export default function Career({ user }: MyProfileProps) {
    const [careerData, setCareerData] = useState<any>(null);
    const [exists, setExists] = useState(false);

    const fetchCareerData = useCallback(async () => {
        if (!user?.uid) return;
        
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/career?uid=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 404) {
                setExists(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error('데이터를 가져오는데 실패했습니다');
            }

            const data = await response.json();
            setExists(true);
            
            const formattedData = {
                highSchoolStatus: data.highSchool?.status || '',
                highSchoolField: data.highSchool?.field || '',
                universityStatus: data.university?.status || '',
                universityMajor: data.university?.major || '',
                graduateSchoolStatus: data.graduateSchool?.status || '',
                graduateSchoolMajor: data.graduateSchool?.major || '',
                certifications: data.certifications?.map((cert: any) => ({
                    name: cert.name,
                    description: cert.description
                })) || [{ name: '', description: '' }]
            };
            
            setCareerData(formattedData);
        } catch (error) {
            console.error('데이터 조회 중 오류 발생:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchCareerData();
    }, [fetchCareerData]);

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                uid: user?.uid,
                highSchool: {
                    status: values.highSchoolStatus,
                    field: values.highSchoolField,
                },
                university: {
                    status: values.universityStatus,
                    major: values.universityMajor,
                },
                graduateSchool: {
                    status: values.graduateSchoolStatus,
                    major: values.graduateSchoolMajor,
                },
                certifications: values.certifications?.map((cert: { name: any; description: any; }) => ({
                    name: cert.name,
                    description: cert.description
                })) || []
            }

            const response = await fetch(`/api/career?uid=${user?.uid}`, {
                method: exists ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData);
                alert('저장 중 문제가 발생했습니다: ' + errorData.message);
                return;
            }
            
            message.success({
                content: '데이터가 성공적으로 저장되었습니다',
                duration: 3,
                className: 'custom-message',
                style: {
                    marginTop: '20px'
                }
            });
            setExists(true);
            
            await fetchCareerData();
            
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('예기치 않은 문제가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-8">
                    <BookOutlined className="text-3xl text-blue-500 mr-4" />
                    <h2 className="text-3xl font-bold text-gray-800">이력 정보 등록</h2>
                </div>

                <CareerForm 
                    onSubmit={handleSubmit} 
                    initialValues={careerData}
                />
            </div>
        </div>
    );
}