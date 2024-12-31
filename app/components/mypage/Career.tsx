import { BookOutlined } from '@ant-design/icons';
import CareerForm from './Career_Form';

export default function Career() {
    const handleSubmit = (values: any) => {
        console.log('Form submitted with values:', values);
        // 저장 로직
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