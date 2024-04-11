import { Modal } from 'antd';

export const confirmation = (message) => {
  return new Promise((resolve) => {
    const handleConfirm = () => {
      resolve(true);
      modal.destroy();
    };

    const handleCancel = () => {
      resolve(false);
      modal.destroy();
    };

    const modal = Modal.confirm({
      title: 'Confirmation',
      content: message,
      onOk: handleConfirm,
      onCancel: handleCancel,
      okButtonProps: {
        className: 'bg-blue-500',
      },
      cancelButtonProps: {
        className: 'bg-red-500 text-white',
      },
      okText: 'Yes',
      cancelText: 'Cancel',
    });
  });
};