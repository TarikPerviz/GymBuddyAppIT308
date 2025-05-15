import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { defaultAvatars, getAvatarByIndex } from '../utils/avatarUtils';

interface AvatarProps {
  size?: number;
  avatarIndex?: number;
  onPress?: () => void;
  style?: object;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 50,
  avatarIndex = 0,
  onPress,
  style,
}) => {
  const { avatarUri } = getAvatarByIndex(avatarIndex);
  
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  const imageStyle = [
    styles.image,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  const content = (
    <Image
      source={avatarUri}
      style={imageStyle}
      resizeMode="cover"
    />
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={containerStyle}>{content}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    backgroundColor: '#e1e1e1',
  },
});

export default Avatar;
