import Swal from 'sweetalert2';

const Alert = {
    confirm: async (title, text, confirmButtonText = 'Yes, do it!') => {
        return await Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText
        });
    },
    success: (title, text) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'success',
            confirmButtonColor: '#3085d6'
        });
    },
    error: (title, text) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'error',
            confirmButtonColor: '#d33'
        });
    }
};

export default Alert;