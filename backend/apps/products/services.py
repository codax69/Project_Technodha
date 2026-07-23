import cloudinary.uploader
from rest_framework.exceptions import ValidationError, APIException

MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024  # Strict 1MB limit, matches frontend rule
ALLOWED_CONTENT_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}


class CloudinaryUploadError(APIException):
    status_code = 502
    default_detail = "Image upload to Cloudinary failed. Please try again."
    default_code = 'cloudinary_upload_failed'


class ProductImageService:
    @staticmethod
    def upload(image_file) -> str:
        """
        Validates and uploads a product image to Cloudinary using a signed,
        server-side request (API secret never leaves the backend), returning
        the resulting secure_url string.

        The uploaded file never persists on our own server: Django buffers
        it in memory (or briefly spills to a temp file on disk for large
        uploads), and it is explicitly closed/deleted in the `finally` block
        below immediately after being handed off to Cloudinary - regardless
        of whether the upload succeeds, fails validation, or errors out.
        """
        if image_file is None:
            raise ValidationError({"image": "No image file provided."})

        try:
            if image_file.size > MAX_IMAGE_SIZE_BYTES:
                size_mb = image_file.size / (1024 * 1024)
                raise ValidationError({
                    "image": f"File size ({size_mb:.2f} MB) exceeds the strict 1MB limit."
                })

            if image_file.content_type not in ALLOWED_CONTENT_TYPES:
                raise ValidationError({
                    "image": "Unsupported file type. Allowed types: JPEG, PNG, WEBP, GIF."
                })

            try:
                result = cloudinary.uploader.upload(
                    image_file,
                    folder="technodha/products",
                    resource_type="image",
                )
            except Exception as exc:
                raise CloudinaryUploadError(detail=f"Cloudinary upload failed: {exc}")

            secure_url = result.get('secure_url')
            if not secure_url:
                raise CloudinaryUploadError(detail="Cloudinary did not return a valid image URL.")

            return secure_url
        finally:
            # Deletes any TemporaryUploadedFile backing this object (large
            # uploads spill to a temp file on disk above
            # FILE_UPLOAD_MAX_MEMORY_SIZE) and frees the in-memory buffer
            # otherwise, so no copy of the image is left on our server.
            image_file.close()
