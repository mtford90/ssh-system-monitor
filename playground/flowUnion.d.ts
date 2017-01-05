import {Action} from "redux";

export interface Dispatch<S> {
    <S extends Action>(action: S): S;
}