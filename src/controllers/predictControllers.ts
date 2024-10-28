// // import axios from "axios";
// import assert from "assert";
// import * as tf from '@tensorflow/tfjs-node';




// let model: tf.LayersModel;

// const loadModel = async () => {
//   model = await tf.loadLayersModel('file://ai/final_model_weights.hdf5');
// }

// loadModel().catch(err=>console.log(err))


// const makePrediction = async (imageBuffer: Buffer) => {
//     // Step 1: Convert the image buffer to a tensor and preprocess it
//     const imageTensor = tf.node.decodeImage(imageBuffer);
//     const normalizedImage = imageTensor.div(tf.scalar(255));
    
//     // Step 2: Resize the image if necessary (assuming the model expects a specific input size)
//     // @ts-ignore
//     const resizedImage = tf.image.resizeBilinear(normalizedImage, [224, 224]); // Adjust size as needed
  
//     // Step 3: Expand dimensions to match the expected input shape of the model
//     const inputTensor = resizedImage.expandDims(0);
  
//     // Step 4: Make the prediction
//     const prediction = model.predict(inputTensor) as tf.Tensor;
  
//     // Get class and probability
//     const predictionArray = prediction.arraySync() as number[][];
  
//     // Assuming the model returns class probabilities, we can determine the predicted class
//     const predictedClass = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
  
//     const probability = predictionArray[0][predictedClass];
  
//     // Step 5: Interpret the results
//     let category: string;
//     if (predictedClass === 1) {
//       category = `The image belongs to Recycle waste category, probability: ${probability}.`;
//     } else {
//       category = `The image belongs to Organic waste category, probability: ${probability}.`;
//     }
  
//     return {
//       category,
//       probability,
//       predictedClass,
//     };
// }

// export async function predict({ uId,buffer }: {
//     buffer:Buffer,
//     uId: String
// }) {
//     try {
//         var p = makePrediction(buffer)
//         return {
//             code: 200,
//             data: p
//         }

//     } catch (error) {
//         if (error instanceof assert.AssertionError) {
//             return {
//                 data: error.message,
//                 code: 401
//             }
//         }
//         return {
//             data: "Internal Server Error",
//             code: 500
//         }
//     }
// }
