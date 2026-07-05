import {clientEnv} from "~/env/client";
import {serverEnv} from "~/env/server";
import {customType} from "drizzle-orm/sqlite-core";


export const customJson = <TData>(name: string) =>
    customType<{ data: TData; driverData: string }>({
        dataType() {
            return "text";
        },
        toDriver(value: TData) {
            return JSON.stringify(value);
        },
        fromDriver(value: string): TData {
            return JSON.parse(value);
        }
    })(name);


export const imageUrl = (name: string) =>
    customType<{ data: string; driverData: string }>({
        dataType() {
            return "text";
        },
        toDriver(value: string) {
            return value;
        },
        fromDriver(value: string) {
            return `${clientEnv.VITE_BASE_URL}/${serverEnv.UPLOADS_DIR_NAME}/${value}`;
        },
    })(name);
