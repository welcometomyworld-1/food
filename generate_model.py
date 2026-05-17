import tensorflow as tf
from tensorflow.keras import layers, models
import os

def create_and_save_dummy_model():
    # Define a simple CNN model architecture
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='sigmoid') # Binary output: 0 (Fresh) or 1 (Spoiled)
    ])

    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy'])

    # Ensure model directory exists
    if not os.path.exists('model'):
        os.makedirs('model')

    # Save the model
    model_path = 'model/model.h5'
    model.save(model_path)
    print(f"Dummy model saved successfully at {model_path}")

if __name__ == "__main__":
    create_and_save_dummy_model()
