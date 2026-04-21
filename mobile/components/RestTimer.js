import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Vibration } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Fonts, Radius } from '../lib/colors';
import CircleProgress from './CircleProgress';

export default function RestTimer({
  visible,
  duration = 60,
  onClose,
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (visible) {
      setTimeLeft(duration);
      setIsActive(true);
    }
  }, [visible, duration]);

  useEffect(() => {
    let interval = null;
    if (visible && isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            Vibration.vibrate([0, 500, 200, 500]); // Vibrate when done
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [visible, isActive, timeLeft]);

  const addTime = (secs) => setTimeLeft((prev) => prev + secs);
  const subTime = (secs) => setTimeLeft((prev) => Math.max(0, prev - secs));

  if (!visible) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>{timeLeft > 0 ? 'Rest Time' : 'Time to lift!'}</Text>
          
          <View style={styles.timerWrapper}>
            <CircleProgress
              value={timeLeft}
              max={duration}
              size={200}
              strokeWidth={12}
              color={timeLeft > 0 ? Colors.neonBlue : Colors.neonGreen}
              label="remaining"
            />
            {/* Overlay large text because CircleProgress limits to small value mapping easily */}
            <View style={styles.timeOverlay}>
              <Text style={[styles.timeText, timeLeft === 0 && { color: Colors.neonGreen }]}>
                {timeStr}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={() => subTime(10)} style={styles.ctrlBtn}>
              <Text style={styles.ctrlTxt}>-10s</Text>
            </Pressable>
            <Pressable onPress={() => addTime(10)} style={styles.ctrlBtn}>
              <Text style={styles.ctrlTxt}>+10s</Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>{timeLeft > 0 ? 'Skip Rest' : 'Continue Workout'}</Text>
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,8,15,0.8)',
  },
  modalCard: {
    width: '85%',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 20,
    color: Colors.text,
    ...Fonts.bold,
    marginBottom: 24,
  },
  timerWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    color: Colors.neonBlue,
    ...Fonts.display,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  ctrlBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ctrlTxt: {
    fontSize: 14,
    color: Colors.textSec,
    ...Fonts.medium,
  },
  closeBtn: {
    marginTop: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  closeTxt: {
    fontSize: 14,
    color: Colors.neonBlue,
    ...Fonts.bold,
  },
});
