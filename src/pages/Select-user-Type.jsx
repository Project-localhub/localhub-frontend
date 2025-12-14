import { useNavigate } from 'react-router-dom';
import { changeUserType } from '../shared/api/auth';

const SelectUserTypePage = () => {
  const navigate = useNavigate();

  const handleSelect = async (type) => {
    try {
      await changeUserType(type);
      alert('유저 타입 설정 완료');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('유저 타입 설정 실패');
    }
  };

  return (
    <div>
      <button onClick={() => handleSelect('CUSTOMER')}>일반 회원</button>
      <button onClick={() => handleSelect('OWNER')}>사업자 회원</button>
    </div>
  );
};

export default SelectUserTypePage;
