import { Router } from 'express';
import { upload } from '../middleware/upload';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticateAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILE',
                    message: 'No file uploaded',
                },
            });
        }

        // Construct full URL
        // NOTE: In production, this should be the full domain. For local, relative path works if proxy/cors is handled
        // Or we can return the path and let frontend handle base URL.
        // Let's return a relative path that serves accessing the static file.
        const fileUrl = `/uploads/${req.file.filename}`;

        return res.json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.filename,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'UPLOAD_ERROR',
                message: 'Failed to upload file',
            },
        });
        return;
    }
});

export default router;
