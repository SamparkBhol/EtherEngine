import * as THREE from 'three';

const GRAVITY_CONSTANT = -9.81; // m/s^2
const TIME_STEP = 1 / 60; // 60 FPS

export const applyPhysics = (scene) => {
  scene.children.forEach(child => {
    if (child.userData.isGameObject && child.userData.physics?.gravity) {
      // Apply gravity
      child.userData.physics.velocity.y += GRAVITY_CONSTANT * TIME_STEP * 0.1; // Scaled down for visual appeal
      child.position.addScaledVector(child.userData.physics.velocity, TIME_STEP);

      // Simple ground collision
      const objectHalfHeight = child.geometry.boundingBox ? child.geometry.boundingBox.max.y * child.scale.y : 0.5 * child.scale.y;
      if (child.position.y - objectHalfHeight < 0) {
        child.position.y = objectHalfHeight;
        child.userData.physics.velocity.y = 0; // Stop falling
      }

      // AABB Collision (very basic)
      scene.children.forEach(other => {
        if (other !== child && other.userData.isGameObject) {
          if (checkAABBCollision(child, other)) {
            // Basic response: stop movement towards each other
            // This is a placeholder and needs a proper collision response system
            const relativeVelocity = new THREE.Vector3().subVectors(child.userData.physics.velocity, other.userData.physics?.velocity || new THREE.Vector3());
            const collisionNormal = new THREE.Vector3().subVectors(child.position, other.position).normalize();
            
            const separatingVelocity = relativeVelocity.dot(collisionNormal);
            if (separatingVelocity < 0) { // Moving towards each other
              // A more robust solution would involve restitution and mass
              child.userData.physics.velocity.sub(collisionNormal.multiplyScalar(separatingVelocity * 0.5)); 
              if(other.userData.physics) {
                other.userData.physics.velocity.add(collisionNormal.multiplyScalar(separatingVelocity * 0.5));
              }
            }
          }
        }
      });
    }
  });
};

function checkAABBCollision(objA, objB) {
  if (!objA.geometry.boundingBox) objA.geometry.computeBoundingBox();
  if (!objB.geometry.boundingBox) objB.geometry.computeBoundingBox();

  const boxA = new THREE.Box3().setFromObject(objA);
  const boxB = new THREE.Box3().setFromObject(objB);
  
  return boxA.intersectsBox(boxB);
}