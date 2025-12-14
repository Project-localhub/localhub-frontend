export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (accessToken) => {
    localStorage.setItem('accessToken', accessToken);

    const res = await getUserInfo();

    setUser({
      id: res.data.id,
      username: res.data.username,
      name: res.data.name,
      email: res.data.email,
      userType: res.data.userType, // ⭐ 중요
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLogin: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
