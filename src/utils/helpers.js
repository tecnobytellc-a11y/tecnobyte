export const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// Function from App.jsx to calculate checkout total considering coupons
export const calculateTotal = (cartItems, appliedCoupon) => Math.max(0, cartItems.reduce((acc, item) => { 
    if (appliedCoupon && appliedCoupon.excludedIds && appliedCoupon.excludedIds.includes(item.id)) return acc + item.price; 
    if (appliedCoupon && (appliedCoupon.discountType || appliedCoupon.type) !== 'fixed') return acc + (item.price * (1 - (Number(appliedCoupon.percent || appliedCoupon.discountValue || appliedCoupon.value) || 0) / 100)); 
    return acc + item.price; 
}, 0) - (appliedCoupon && (appliedCoupon.discountType || appliedCoupon.type) === 'fixed' ? (Number(appliedCoupon.discountValue || appliedCoupon.amount || appliedCoupon.value) || 0) : 0));
