from PIL import Image

def merge_image(image_path, repeat_x, repeat_y, output_path):
    img = Image.open(image_path)
    
    # Get the width and height of the image
    width, height = img.size
    
    # Create a new blank image to accommodate the repeated images
    merged_img = Image.new('RGB', (width * repeat_x, height * repeat_y))
    
    # Paste the original image into the new blank image in a grid
    for x in range(repeat_x):
        for y in range(repeat_y):
            merged_img.paste(img, (x * width, y * height))
    
    # Save the resulting merged image
    merged_img.save(output_path)
    print(f'Merged image saved as {output_path}')

# Example usage
image_path = 'space_texture.jpg'  # Path to your image
output_path = 'merged_image.jpg'  # Path to save the merged image
merge_image(image_path, repeat_x=5, repeat_y=3, output_path=output_path)
