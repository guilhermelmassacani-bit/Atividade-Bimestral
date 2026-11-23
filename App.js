import React, { useState, useEffect } from 'react';
import { StyleSheet,Text, View, TextInput, Button, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { supabase } from './src/services/supabase';
import { registerForLocalNotificationsAsync, triggerLocalNotification } from './src/helper/notificationsHelper';

export default function App() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('🟡 Conectando...');

  useEffect(() => {
    registerForLocalNotificationsAsync().then((ok) => {
      if (!ok) setStatus('🟠 Sem Permissão de Notificação');
    });

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        ({ new: data }) => {
          if (data?.title && data?.body) {
            triggerLocalNotification(data.title, data.body);
          }
        }
      )
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') setStatus('🟢 Conectado e Escutando Avisos');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendNotification = async () => {
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      return Alert.alert('Atenção', 'Preencha o título e a mensagem.');
    }

    setLoading(true);
    const { error } = await supabase
      .from('notifications')
      .insert([{ title: cleanTitle, body: cleanMessage }]);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao enviar', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Notificação transmitida!');
    setTitle('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>📡 Alertas escolares (Realtime)</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status do Sistema:</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subHeader}>Área do Coordenador</Text>

        <TextInput
          style={styles.input}
          placeholder="Título (ex: Prova Liberada)"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mensagem (ex: Confira no sistema acadêmico)"
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Button title="DISPARAR ALERTA" onPress={sendNotification} />
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FC',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 40,
  },

  header: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
    color: '#102D50',
    letterSpacing: 0.3,
  },

  statusContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#183B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E1EAF5',
  },

  label: {
    fontSize: 13,
    color: '#71839A',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#174A7E',
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#DCE6F2',
    marginVertical: 30,
  },

  subHeader: {
    fontSize: 21,
    fontWeight: '800',
    color: '#174A7E',
    marginBottom: 18,
  },

  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 13,
    marginBottom: 16,
    fontSize: 15,
    color: '#183653',
    borderWidth: 1,
    borderColor: '#D8E4F2',
    elevation: 2,
    shadowColor: '#183B63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },

  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
