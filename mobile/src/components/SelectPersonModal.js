import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

const SelectPersonModal = ({
  visible,
  title,
  data = [],
  selectedId,
  onSelect,
  onClose,
  getName,
  getEmail,
}) => {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return data;
    }

    return data.filter((item) => {
      const name = getName(item).toLowerCase();
      const email = getEmail(item).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query)
      );
    });
  }, [data, search, getName, getEmail]);

  const handleSelect = (item) => {
    setSearch("");
    onSelect(item);
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {filteredData.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No results found
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item._id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = selectedId === item._id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.person,
                      selected && styles.selectedPerson,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getName(item)
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.name}>
                        {getName(item)}
                      </Text>

                      <Text style={styles.email}>
                        {getEmail(item)}
                      </Text>
                    </View>

                    {selected && (
                      <Text style={styles.check}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  close: {
    fontSize: 22,
    color: "#555",
  },

  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },

  person: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
  },

  selectedPerson: {
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#f1f1f1",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  personInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  check: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  empty: {
    padding: 30,
    alignItems: "center",
  },

  emptyText: {
    color: "#777",
  },
});

export default SelectPersonModal;