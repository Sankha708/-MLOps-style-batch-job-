import json
import random
import time
import sys

def run_ml_job(seed, epochs, lr, noise):
    """
    A reproducible ML batch job simulation.
    Uses a fixed seed to ensure deterministic results.
    """
    random.seed(seed)
    start_time = time.time()
    
    metrics = []
    logs = []
    
    logs.append(f"[INFO] Initializing job with seed: {seed}")
    
    current_loss = 1.0
    current_accuracy = 0.0
    
    for epoch in range(1, epochs + 1):
        # Simulated learning step
        step = random.uniform(0, lr)
        noise_factor = random.uniform(-noise, noise)
        
        current_loss = max(0, current_loss - step + (noise_factor * 0.1))
        current_accuracy = min(1, current_accuracy + (step * 0.8) - (noise_factor * 0.05))
        
        metrics.append({
            "epoch": epoch,
            "loss": round(current_loss, 4),
            "accuracy": round(current_accuracy, 4)
        })
        
        if epoch % max(1, epochs // 5) == 0:
            logs.append(f"[TRAIN] Epoch {epoch}/{epochs}: loss={current_loss:.4f}, acc={current_accuracy:.4f}")
            
    duration = time.time() - start_time
    
    output = {
        "metadata": {
            "seed": seed,
            "duration_sec": round(duration, 4),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        },
        "metrics": metrics,
        "final_stats": {
            "loss": current_loss,
            "accuracy": current_accuracy
        }
    }
    
    return output, logs

if __name__ == "__main__":
    # Default config
    config = {
        "seed": 42,
        "epochs": 20,
        "learning_rate": 0.05,
        "noise_level": 0.02
    }
    
    # Run job
    results, logs = run_ml_job(
        config["seed"], 
        config["epochs"], 
        config["learning_rate"], 
        config["noise_level"]
    )
    
    # Output for observability
    for log in logs:
        print(log)
        
    with open("metrics.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"\n[SUCCESS] Job completed. Metrics saved to metrics.json")
