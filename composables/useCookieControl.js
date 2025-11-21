export const useCookieControl = () => {
  const isCookieModalVisible = useState('cookieModalVisible', () => false);

  const openCookieModal = () => {
    isCookieModalVisible.value = true;
  };

  const closeCookieModal = () => {
    isCookieModalVisible.value = false;
  };
  return {
    isCookieModalVisible,
    openCookieModal,
    closeCookieModal
  };
};