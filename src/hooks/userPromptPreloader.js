// Modules

import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";

const userPromptPreloader = () => {
    const navigation = useNavigation();
    const [promptPreLoaderValue, setPromptPreLoaderValue] = useState('');
    useEffect(() => {
        if (navigation.formData) {
            setPromptPreLoaderValue(navigation.formData.get('user_prompt'));
        } else {
            setPromptPreLoaderValue('');
        }
    }, [navigation]);
    return { promptPreLoaderValue };
};

export { userPromptPreloader };