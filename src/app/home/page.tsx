
import Tasks from "../../components/forms/home";
import { createClient } from "../utils/superbase/server";

export default async function HomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return <Tasks user={user} />;
}