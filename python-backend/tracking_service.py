import cv2
import os
import time
from ultralytics import YOLO

class VideoTracker:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = YOLO(model_path)

    def process_video(self, input_path, output_path, conf_threshold=0.5, iou_threshold=0.45):
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            return None, f"Error: Could not open video file at {input_path}"

        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps    = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Turbo Resolution: Standard 480p for 10x Speed boost on CPU
        render_width = 480 
        render_height = int(height * (render_width / width)) if width > 0 else 360
        
        # Ensure dimensions are multiples of 4 to prevent video codecs from corrupting (shearing/rolling) the frames
        render_width = (render_width // 4) * 4
        render_height = (render_height // 4) * 4
        
        # Dynamic Skip Setup: Aim for ~250 processed frames total to finish within 20-30 seconds
        target_inferences = 250
        skip_frames = max(1, total_frames // target_inferences)
        
        # Robust Codec Probe
        codecs = ['avc1', 'mp4v', 'XVID']
        out = None
        for code in codecs:
            try:
                fourcc = cv2.VideoWriter_fourcc(*code)
                test_out = cv2.VideoWriter(output_path, fourcc, fps, (render_width, render_height))
                if test_out.isOpened():
                    out = test_out
                    break
            except: continue
        
        if out is None: return None, "Fatal: Could not initialize output video stream."

        frame_count = 0
        total_detections = 0
        t_start = time.time()
        last_annotated = None
        
        print(f"🚀 TURBO MISSION: {total_frames} frames | Dynamic Skip: {skip_frames}x | Imgsz: 320")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            # Process according to dynamic skip
            if frame_count % skip_frames == 0:
                frame = cv2.resize(frame, (render_width, render_height))
                
                # Inference at Ultra-low 320px
                results = self.model.track(
                    frame, 
                    persist=True, 
                    conf=conf_threshold, 
                    iou=iou_threshold,
                    tracker="bytetrack.yaml",
                    verbose=False,
                    imgsz=320 
                )[0]
                
                annotated_frame = results.plot()
                last_annotated = annotated_frame
                
                num_objects = len(results.boxes) if results.boxes is not None else 0
                total_detections += num_objects
            elif last_annotated is not None:
                # Use cached frame for skip
                annotated_frame = last_annotated
            else:
                annotated_frame = cv2.resize(frame, (render_width, render_height))

            # Lightweight HUD
            if frame_count % skip_frames == 0:
                cv2.putText(annotated_frame, f"TURBO_ANALYSIS | FPS: {frame_count/(time.time()-t_start + 0.001):.1f}", (20, 30), 
                            cv2.FONT_HERSHEY_DUPLEX, 0.4, (0, 242, 255), 1, cv2.LINE_AA)

            out.write(annotated_frame)
            frame_count += 1
            if frame_count % 100 == 0:
                print(f"Turbo Progress: {frame_count}/{total_frames} ({int(frame_count/total_frames*100)}%) | Avg FPS: {frame_count/(time.time()-t_start):.1f}")
            
            # Fail-safe: force stop if processing exceeds 28 seconds to guarantee 20-30s SLA
            if (time.time() - t_start) > 28:
                print("28s Time Limit Reached. Saving what we have to guarantee SLA.")
                break

        cap.release()
        out.release()
        
        proc_time = time.time() - t_start
        print(f"Turbo Mission Finished. Average FPS: {frame_count / proc_time:.1f}")
        
        return {
            "processed_video": output_path,
            "total_frames": frame_count,
            "processing_time": proc_time,
            "avg_fps": frame_count / proc_time,
            "detections_count": total_detections
        }, None
