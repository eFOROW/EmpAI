import { BookOutlined } from '@ant-design/icons';
import CareerForm from './Career_Form';
import { User } from "firebase/auth";
import { useState, useEffect } from "react";

interface MyProfileProps {
    user: User | null;
}

export default function Career({ user }: MyProfileProps) {
    const handleSubmit = async (values: any) => {
        try {
            console.log('Form submitted with values:', values);

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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Form 데이터를 JSON으로 변환
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData);
                alert('저장 중 문제가 발생했습니다: ' + errorData.message);
                return;
            }
            
            alert('데이터가 성공적으로 저장되었습니다!');
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

                <CareerForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}